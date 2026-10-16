import { ErrorBoundary } from '@/components/admin/error-boundary';
import { FlashToasts } from '@/components/admin/flash-toasts';
import { Sidebar } from '@/components/admin/sidebar/sidebar';
import { SlowConnectionNotice } from '@/components/admin/slow-connection-notice';
import { Topbar } from '@/components/admin/topbar';
import { TopbarSlotProvider } from '@/components/admin/topbar-actions';
import { ConfirmProvider, Drawer, ToastProvider, type BreadcrumbEntry } from '@/components/core';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useNavigationPending } from '@/hooks/use-navigation-pending';
import { useSyncTranslations } from '@/hooks/use-translation';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { useCallback, useState, type ReactNode } from 'react';

const COLLAPSED_STORAGE_KEY = 'finance-core.sidebar-collapsed';

function readCollapsedPreference(): boolean {
    try {
        return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
}

function storeCollapsedPreference(isCollapsed: boolean): void {
    try {
        window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed));
    } catch {
        // Storage can be unavailable (private mode); the preference simply is not remembered.
    }
}

export interface AdminLayoutProps {
    breadcrumbs?: BreadcrumbEntry[];
    /** Page title shown in the topbar under the breadcrumb, e.g. on create and edit pages. */
    title?: string;
    /** Values for `:placeholders` in `title`. The title is translated by the topbar. */
    titleParams?: Record<string, string | number>;
    children: ReactNode;
}

export default function AdminLayout({ breadcrumbs, title, titleParams, children }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(() => (typeof window === 'undefined' ? false : readCollapsedPreference()));
    useSyncTranslations();
    const mobileMenu = useDisclosure();
    const pageUrl = usePage().url;
    const navigation = useNavigationPending();

    const toggleCollapse = useCallback(() => {
        setIsCollapsed((current) => {
            storeCollapsedPreference(!current);

            return !current;
        });
    }, []);

    return (
        <ToastProvider>
            <ConfirmProvider>
                <TopbarSlotProvider>
                    <FlashToasts />
                    <div className="bg-surface text-ink flex min-h-screen">
                        <div
                            className={cn(
                                'border-line sticky top-0 hidden h-screen shrink-0 border-r transition-[width] duration-200 ease-out lg:block',
                                isCollapsed ? 'w-16' : 'w-60',
                            )}
                        >
                            <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleCollapse} enableSearchShortcut />
                        </div>

                        <Drawer isOpen={mobileMenu.isOpen} onClose={mobileMenu.close} title={__('Navigation menu')}>
                            <Sidebar onClose={mobileMenu.close} />
                        </Drawer>

                        <div className="flex min-w-0 flex-1 flex-col">
                            <Topbar breadcrumbs={breadcrumbs} title={title} titleParams={titleParams} onOpenMenu={mobileMenu.open} />
                            <main
                                aria-busy={navigation.isPending || undefined}
                                className={cn(
                                    'animate-fade p-page flex-1 transition-opacity duration-200',
                                    navigation.isPending && 'pointer-events-none opacity-60',
                                )}
                            >
                                <ErrorBoundary size="page" resetKey={pageUrl}>
                                    {children}
                                </ErrorBoundary>
                            </main>
                        </div>

                        <SlowConnectionNotice isVisible={navigation.isSlow} />
                    </div>
                </TopbarSlotProvider>
            </ConfirmProvider>
        </ToastProvider>
    );
}

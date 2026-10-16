import { Breadcrumb, IconButton, type BreadcrumbEntry } from '@/components/core';
import { formatDate } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { Link } from '@inertiajs/react';
import { Bell, CalendarDays, Menu, Settings } from 'lucide-react';
import { TopbarActionsSlot } from './topbar-actions';

export interface TopbarProps {
    breadcrumbs?: BreadcrumbEntry[];
    /**
     * Page title for detail pages such as create and edit forms. When set, the
     * breadcrumb shrinks into a small line above the title.
     */
    title?: string;
    /** Values for `:placeholders` in `title`, e.g. `{ name: 'Budi' }` for "Edit user · :name". */
    titleParams?: Record<string, string | number>;
    onOpenMenu: () => void;
}

export function Topbar({ breadcrumbs = [], title, titleParams, onOpenMenu }: TopbarProps) {
    return (
        <header className="border-line bg-surface/90 h-topbar sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
            <IconButton label={__('Open menu')} className="lg:hidden" onClick={onOpenMenu}>
                <Menu />
            </IconButton>

            {title ? (
                <div className="min-w-0 flex-1">
                    <Breadcrumb items={breadcrumbs} size="sm" />
                    <h1 className="text-ink truncate text-base leading-tight font-semibold">{__(title, titleParams)}</h1>
                </div>
            ) : (
                <Breadcrumb items={breadcrumbs} className="min-w-0 flex-1" />
            )}

            <TopbarActionsSlot className="flex shrink-0 items-center gap-2 empty:hidden" />

            <div className="flex shrink-0 items-center gap-1">
                <span className="text-ink-muted mr-2 hidden items-center gap-1.5 text-xs md:inline-flex">
                    <CalendarDays className="size-3.5" />
                    {formatDate(new Date(), 'full')}
                </span>
                <IconButton label={__('Notifications')} className="relative">
                    <Bell />
                    <span className="bg-danger ring-surface absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2" />
                </IconButton>
                <Link
                    href="/settings/profile"
                    aria-label={__('Settings')}
                    title={__('Settings')}
                    className="text-ink-muted hover:bg-surface-hover hover:text-ink rounded-field inline-flex size-8 items-center justify-center transition-colors"
                >
                    <Settings className="size-4" />
                </Link>
            </div>
        </header>
    );
}

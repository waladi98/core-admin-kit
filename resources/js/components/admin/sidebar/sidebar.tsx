import { IconButton, Kbd } from '@/components/core';
import { mainNavigation, supportNavigation } from '@/config/navigation';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { PanelLeft, Search, X } from 'lucide-react';
import { BrandLogo } from '../brand-logo';
import { useCommandPalette } from '../command-palette';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';

export interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    /** When set, the sidebar is rendered inside the mobile drawer and shows a close button. */
    onClose?: () => void;
    className?: string;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse, onClose, className }: SidebarProps) {
    const commandPalette = useCommandPalette();

    const openSearch = () => {
        onClose?.();
        commandPalette.open();
    };

    return (
        <aside className={cn('bg-surface-muted flex h-full flex-col', className)}>
            <div className={cn('h-topbar flex shrink-0 items-center gap-2 px-3', isCollapsed && 'justify-center px-0')}>
                {!isCollapsed && (
                    <Link href="/dashboard" className="min-w-0 flex-1" onClick={onClose}>
                        <BrandLogo />
                    </Link>
                )}
                {onClose ? (
                    <IconButton label={__('Close menu')} onClick={onClose}>
                        <X />
                    </IconButton>
                ) : (
                    <IconButton label={isCollapsed ? __('Expand sidebar') : __('Collapse sidebar')} onClick={onToggleCollapse}>
                        <PanelLeft />
                    </IconButton>
                )}
            </div>

            <div className={cn('shrink-0 px-3 pb-3', isCollapsed && 'flex justify-center px-0')}>
                {isCollapsed ? (
                    <IconButton label={__('Search anything')} onClick={openSearch}>
                        <Search />
                    </IconButton>
                ) : (
                    // Opens the command palette (also ⌘K / Ctrl+K anywhere).
                    <button
                        type="button"
                        onClick={openSearch}
                        className="rounded-field border-line bg-surface text-ink-subtle hover:border-line-strong h-control focus-visible:ring-brand/20 flex w-full items-center gap-2 border px-3 text-left text-sm transition-colors outline-none focus-visible:ring-2"
                    >
                        <Search className="size-4 shrink-0" aria-hidden="true" />
                        <span className="flex-1 truncate">{__('Search anything')}</span>
                        <Kbd>⌘K</Kbd>
                    </button>
                )}
            </div>

            <div className={cn('scrollbar-thin scroll-fade-y flex-1 overflow-y-auto px-3 py-3', isCollapsed && 'px-2')}>
                <SidebarNav groups={mainNavigation} isCollapsed={isCollapsed} onNavigate={onClose} />
            </div>

            <div className={cn('shrink-0 space-y-3 px-3 pt-2 pb-3', isCollapsed && 'px-2')}>
                <SidebarNav groups={supportNavigation} isCollapsed={isCollapsed} onNavigate={onClose} />
                <SidebarUser isCollapsed={isCollapsed} />
            </div>
        </aside>
    );
}

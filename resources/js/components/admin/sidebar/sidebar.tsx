import { IconButton, Input, Kbd } from '@/components/core';
import { mainNavigation, supportNavigation } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { PanelLeft, Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { BrandLogo } from '../brand-logo';
import { SidebarNav } from './sidebar-nav';
import { SidebarUser } from './sidebar-user';

export interface SidebarProps {
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    /** When set, the sidebar is rendered inside the mobile drawer and shows a close button. */
    onClose?: () => void;
    /** Enables the ⌘K / Ctrl+K shortcut. Only one rendered sidebar should own it. */
    enableSearchShortcut?: boolean;
    className?: string;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse, onClose, enableSearchShortcut = false, className }: SidebarProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!enableSearchShortcut) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();

                if (isCollapsed) {
                    onToggleCollapse?.();
                }

                requestAnimationFrame(() => searchInputRef.current?.focus());
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enableSearchShortcut, isCollapsed, onToggleCollapse]);

    return (
        <aside className={cn('bg-surface-muted flex h-full flex-col', className)}>
            <div className={cn('flex h-14 shrink-0 items-center gap-2 px-3', isCollapsed && 'justify-center px-0')}>
                {!isCollapsed && (
                    <Link href="/dashboard" className="min-w-0 flex-1" onClick={onClose}>
                        <BrandLogo />
                    </Link>
                )}
                {onClose ? (
                    <IconButton label="Close menu" onClick={onClose}>
                        <X />
                    </IconButton>
                ) : (
                    <IconButton label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={onToggleCollapse}>
                        <PanelLeft />
                    </IconButton>
                )}
            </div>

            <div className={cn('shrink-0 px-3 pb-3', isCollapsed && 'flex justify-center px-0')}>
                {isCollapsed ? (
                    <IconButton label="Search" onClick={onToggleCollapse}>
                        <Search />
                    </IconButton>
                ) : (
                    <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search anything"
                        aria-label="Search anything"
                        leadingIcon={<Search />}
                        trailing={<Kbd>⌘K</Kbd>}
                    />
                )}
            </div>

            <div className={cn('flex-1 overflow-y-auto px-3 py-2', isCollapsed && 'px-2')}>
                <SidebarNav groups={mainNavigation} isCollapsed={isCollapsed} onNavigate={onClose} />
            </div>

            <div className={cn('shrink-0 space-y-3 px-3 pt-2 pb-3', isCollapsed && 'px-2')}>
                <SidebarNav groups={supportNavigation} isCollapsed={isCollapsed} onNavigate={onClose} />
                <SidebarUser isCollapsed={isCollapsed} />
            </div>
        </aside>
    );
}

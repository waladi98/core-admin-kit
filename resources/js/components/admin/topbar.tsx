import { Breadcrumb, IconButton, type BreadcrumbEntry } from '@/components/core';
import { Link } from '@inertiajs/react';
import { Bell, Menu, Settings } from 'lucide-react';

export interface TopbarProps {
    breadcrumbs?: BreadcrumbEntry[];
    onOpenMenu: () => void;
}

export function Topbar({ breadcrumbs = [], onOpenMenu }: TopbarProps) {
    return (
        <header className="border-line bg-surface/90 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4 backdrop-blur lg:px-6">
            <IconButton label="Open menu" className="lg:hidden" onClick={onOpenMenu}>
                <Menu />
            </IconButton>

            <Breadcrumb items={breadcrumbs} className="min-w-0 flex-1" />

            <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Notifications" className="relative">
                    <Bell />
                    <span className="bg-danger ring-surface absolute top-1.5 right-1.5 size-1.5 rounded-full ring-2" />
                </IconButton>
                <Link
                    href="/settings/profile"
                    aria-label="Settings"
                    title="Settings"
                    className="text-ink-muted hover:bg-surface-hover hover:text-ink rounded-field inline-flex size-8 items-center justify-center transition-colors"
                >
                    <Settings className="size-4" />
                </Link>
            </div>
        </header>
    );
}

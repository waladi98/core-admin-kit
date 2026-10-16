import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound, UserRound, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

const settingsNavigation: { title: string; href: string; icon: LucideIcon }[] = [
    { title: 'Profile', href: '/settings/profile', icon: UserRound },
    { title: 'Password', href: '/settings/password', icon: KeyRound },
];

/**
 * Settings pages: a short section menu next to the page content.
 * The page title comes from the topbar (`AdminLayout title`).
 */
export default function SettingsLayout({ children }: { children: ReactNode }) {
    const currentPath = usePage().url.split('?')[0];

    return (
        <div className="gap-section flex flex-col lg:flex-row lg:items-start">
            <nav
                aria-label="Settings"
                className="scrollbar-thin flex gap-1 overflow-x-auto lg:sticky lg:top-[calc(var(--spacing-topbar)+var(--spacing-page))] lg:w-48 lg:shrink-0 lg:flex-col"
            >
                {settingsNavigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'rounded-field h-control flex items-center gap-2.5 px-3 text-sm whitespace-nowrap transition-colors',
                                isActive
                                    ? 'bg-surface-muted text-ink ring-line font-medium ring-1'
                                    : 'text-ink-soft hover:bg-surface-hover hover:text-ink',
                            )}
                        >
                            <Icon className="size-4 shrink-0" />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            <div className="gap-section flex min-w-0 flex-1 flex-col lg:max-w-4xl">{children}</div>
        </div>
    );
}

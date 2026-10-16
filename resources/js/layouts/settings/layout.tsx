import { PageHeader } from '@/components/admin/page-header';
import { Panel } from '@/components/core';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound, UserRound, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

const settingsNavigation: { title: string; href: string; icon: LucideIcon }[] = [
    { title: 'Profile', href: '/settings/profile', icon: UserRound },
    { title: 'Password', href: '/settings/password', icon: KeyRound },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
    const currentPath = usePage().url.split('?')[0];

    return (
        <div className="space-y-6">
            <PageHeader title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col gap-6 lg:flex-row">
                <nav className="flex gap-1 overflow-x-auto lg:w-52 lg:shrink-0 lg:flex-col">
                    {settingsNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className={cn(
                                    'rounded-field flex h-9 items-center gap-2.5 px-3 text-sm whitespace-nowrap transition-colors',
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

                <Panel className="flex-1 lg:max-w-3xl">
                    <Panel.Body className="space-y-10 p-6">{children}</Panel.Body>
                </Panel>
            </div>
        </div>
    );
}

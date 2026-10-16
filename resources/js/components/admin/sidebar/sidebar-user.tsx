import { Avatar, Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from '@/components/core';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown, Languages, LogOut, UserRound } from 'lucide-react';

export function SidebarUser({ isCollapsed }: { isCollapsed: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const { t, locale, locales } = useTranslation();
    const user = auth.user;

    const switchLocale = (nextLocale: string) => {
        if (nextLocale !== locale) {
            router.post(route('locale.update'), { locale: nextLocale }, { preserveScroll: true });
        }
    };

    return (
        <Dropdown className="w-full">
            <DropdownTrigger
                aria-label={t('Open user menu')}
                className={cn(
                    'border-line bg-surface shadow-panel hover:bg-surface-hover focus-visible:ring-brand/20 rounded-field flex w-full items-center gap-2.5 border text-left transition-colors focus-visible:ring-2',
                    isCollapsed ? 'justify-center border-transparent bg-transparent p-1 shadow-none' : 'p-2',
                )}
            >
                <Avatar name={user.name} src={user.avatar} isOnline />
                {!isCollapsed && (
                    <>
                        <span className="min-w-0 flex-1">
                            <span className="text-ink block truncate text-sm font-medium">{user.name}</span>
                            <span className="text-ink-muted block truncate text-xs">{user.email}</span>
                        </span>
                        <ChevronsUpDown className="text-ink-subtle size-4 shrink-0" />
                    </>
                )}
            </DropdownTrigger>
            <DropdownContent side={isCollapsed ? 'right' : 'top'} align={isCollapsed ? 'end' : 'start'} className="w-56">
                <DropdownLabel>{user.email}</DropdownLabel>
                <DropdownSeparator />
                <DropdownItem icon={<UserRound />} href={route('profile.edit')}>
                    {t('Profile')}
                </DropdownItem>
                <DropdownSeparator />
                <DropdownLabel className="flex items-center gap-1.5">
                    <Languages className="size-3.5" />
                    {t('Language')}
                </DropdownLabel>
                {Object.entries(locales).map(([code, name]) => (
                    <DropdownItem key={code} onSelect={() => switchLocale(code)} icon={code === locale ? <Check /> : <span className="size-4" />}>
                        {name}
                    </DropdownItem>
                ))}
                <DropdownSeparator />
                <DropdownItem icon={<LogOut />} tone="danger" href={route('logout')} method="post" onSelect={() => router.flushAll()}>
                    {t('Log out')}
                </DropdownItem>
            </DropdownContent>
        </Dropdown>
    );
}

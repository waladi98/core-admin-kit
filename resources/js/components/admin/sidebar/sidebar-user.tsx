import { Avatar, Dropdown, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger } from '@/components/core';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, UserRound } from 'lucide-react';

export function SidebarUser({ isCollapsed }: { isCollapsed: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <Dropdown className="w-full">
            <DropdownTrigger
                aria-label="Open user menu"
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
                    Profile
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem icon={<LogOut />} tone="danger" href={route('logout')} method="post" onSelect={() => router.flushAll()}>
                    Log out
                </DropdownItem>
            </DropdownContent>
        </Dropdown>
    );
}

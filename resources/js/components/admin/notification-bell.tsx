import { Popover, PopoverContent, PopoverTrigger, Skeleton, iconButtonVariants } from '@/components/core';
import { formatRelative } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type NotificationItem, type SharedData } from '@/types';
import { router, usePage, usePoll } from '@inertiajs/react';
import { Bell, BellOff, CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

const toneIcons: Record<string, { icon: LucideIcon; className: string }> = {
    info: { icon: Info, className: 'text-info' },
    success: { icon: CircleCheck, className: 'text-success' },
    warning: { icon: TriangleAlert, className: 'text-warning' },
    danger: { icon: CircleAlert, className: 'text-danger' },
};

/** Translates the text and the placeholder values (e.g. a role name) into the reader's language. */
function translateNotification(text: string, params: Record<string, unknown>): string {
    const translatedParams = Object.fromEntries(Object.entries(params).map(([key, value]) => [key, __(String(value))]));

    return __(text, translatedParams);
}

/**
 * Bell in the topbar: unread count (refreshed every minute) and the latest notifications,
 * loaded only when the panel opens. Send notifications with App\Notifications\AppNotification.
 */
export function NotificationBell() {
    const { notifications, notificationItems } = usePage<SharedData>().props;
    const [isLoading, setIsLoading] = useState(false);
    const unreadCount = notifications?.unreadCount ?? 0;

    usePoll(60_000, { only: ['notifications'] }, { keepAlive: false });

    const load = () => {
        router.reload({
            only: ['notifications', 'notificationItems'],
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const open = (item: NotificationItem, close: () => void) => {
        const visitTarget = () => {
            close();

            if (item.url) {
                router.visit(item.url);
            }
        };

        if (item.readAt) {
            visitTarget();
            return;
        }

        router.post(
            route('notifications.read', item.id),
            {},
            { preserveScroll: true, only: ['notifications', 'notificationItems'], onSuccess: visitTarget },
        );
    };

    const markAllAsRead = () => {
        router.post(route('notifications.read-all'), {}, { preserveScroll: true, only: ['notifications', 'notificationItems'] });
    };

    return (
        <Popover>
            <PopoverTrigger
                onClick={load}
                aria-label={unreadCount > 0 ? __(':count unread notifications', { count: unreadCount }) : __('Notifications')}
                className={cn(iconButtonVariants({ variant: 'ghost' }), 'relative')}
            >
                <Bell />
                {unreadCount > 0 && (
                    <span className="bg-danger ring-surface text-danger-foreground absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-xs leading-none font-semibold ring-2">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-96">
                {({ close }) => (
                    <>
                        <div className="border-line flex items-center justify-between border-b px-4 py-3">
                            <p className="text-ink text-sm font-semibold">{__('Notifications')}</p>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    className="text-ink-soft hover:text-ink text-xs font-medium underline underline-offset-4"
                                >
                                    {__('Mark all as read')}
                                </button>
                            )}
                        </div>

                        <div className="scrollbar-thin max-h-96 overflow-y-auto p-1">
                            {isLoading && !notificationItems ? (
                                <div className="space-y-3 p-3">
                                    {[1, 2, 3].map((row) => (
                                        <div key={row} className="flex gap-3">
                                            <Skeleton shape="circle" className="size-8 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton shape="text" className="w-2/3" />
                                                <Skeleton shape="text" className="w-full" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : !notificationItems || notificationItems.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                                    <BellOff className="text-ink-subtle size-6" aria-hidden="true" />
                                    <p className="text-ink-muted text-sm">{__('No notifications yet.')}</p>
                                </div>
                            ) : (
                                <ul>
                                    {notificationItems.map((item) => {
                                        const tone = toneIcons[item.tone] ?? toneIcons.info;
                                        const Icon = tone.icon;

                                        return (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => open(item, close)}
                                                    className="rounded-field hover:bg-surface-hover flex w-full gap-3 p-3 text-left transition-colors"
                                                >
                                                    <span className="border-line bg-surface rounded-field flex size-8 shrink-0 items-center justify-center border">
                                                        <Icon className={cn('size-4', tone.className)} aria-hidden="true" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="flex items-start justify-between gap-2">
                                                            <span className={cn('text-ink text-[13px]', !item.readAt && 'font-semibold')}>
                                                                {translateNotification(item.title, item.params)}
                                                            </span>
                                                            {!item.readAt && (
                                                                <span
                                                                    className="bg-info mt-1.5 size-2 shrink-0 rounded-full"
                                                                    aria-label={__('Unread')}
                                                                />
                                                            )}
                                                        </span>
                                                        {item.body && (
                                                            <span className="text-ink-muted mt-0.5 block text-xs">
                                                                {translateNotification(item.body, item.params)}
                                                            </span>
                                                        )}
                                                        <span className="text-ink-subtle mt-1 block text-xs">{formatRelative(item.createdAt)}</span>
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </PopoverContent>
        </Popover>
    );
}

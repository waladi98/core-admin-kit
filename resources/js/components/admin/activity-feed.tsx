import { Input, SegmentedControl, type SegmentedOption } from '@/components/core';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type Activity, type ActivityPeriod, type ActivityType } from '@/types/dashboard';
import { LogIn, LogOut, Pencil, Plus, Search, SlidersHorizontal, Trash2, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const activityStyles: Record<ActivityType, { icon: LucideIcon; color: string }> = {
    created: { icon: Plus, color: 'text-success' },
    updated: { icon: Pencil, color: 'text-info' },
    deleted: { icon: Trash2, color: 'text-danger' },
    changed: { icon: SlidersHorizontal, color: 'text-warning' },
    signed_in: { icon: LogIn, color: 'text-brand' },
    signed_out: { icon: LogOut, color: 'text-ink-muted' },
};

const periodOptions: SegmentedOption<ActivityPeriod>[] = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This week' },
];

const periodLabels: Record<ActivityPeriod, string> = {
    today: 'today',
    yesterday: 'yesterday',
    this_week: 'this week',
};

export interface ActivityFeedProps {
    activities: Record<ActivityPeriod, Activity[]>;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const [period, setPeriod] = useState<ActivityPeriod>('today');
    const [searchTerm, setSearchTerm] = useState('');

    const visibleActivities = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();
        const periodActivities = activities[period] ?? [];

        if (!keyword) {
            return periodActivities;
        }

        return periodActivities.filter((activity) =>
            `${activity.title} ${__(activity.title)} ${activity.description}`.toLowerCase().includes(keyword),
        );
    }, [activities, period, searchTerm]);

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            <SegmentedControl
                options={periodOptions.map((option) => ({ ...option, label: __(option.label) }))}
                value={period}
                onChange={setPeriod}
                label={__('Activity period')}
            />
            <Input
                type="search"
                placeholder={__('Search activities')}
                aria-label={__('Search activities')}
                leadingIcon={<Search />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
            <p className="text-ink-muted border-line border-b pb-3 text-xs">
                <span className="text-ink text-base font-semibold">{visibleActivities.length}</span>{' '}
                {__('new activities :period', { period: __(periodLabels[period]) })}
            </p>

            {visibleActivities.length === 0 ? (
                <p className="text-ink-subtle py-8 text-center text-sm">{__('No activities found.')}</p>
            ) : (
                <ul className="scrollbar-thin scroll-fade-y -mr-2 min-h-0 flex-1 space-y-4 overflow-y-auto py-1 pr-2">
                    {visibleActivities.map((activity) => {
                        const style = activityStyles[activity.type] ?? activityStyles.changed;
                        const Icon = style.icon;

                        return (
                            <li key={activity.id} className="flex gap-3">
                                <span className="border-line bg-surface shadow-panel rounded-field flex size-8 shrink-0 items-center justify-center border">
                                    <Icon className={cn('size-4', style.color)} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="text-ink truncate text-[13px] font-medium">{__(activity.title)}</p>
                                        <time className="text-ink-subtle shrink-0 text-xs">{activity.time}</time>
                                    </div>
                                    <p className="text-ink-muted mt-0.5 text-xs">{activity.description}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

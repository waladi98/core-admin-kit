import { Input, SegmentedControl, type SegmentedOption } from '@/components/core';
import { cn } from '@/lib/utils';
import { type Activity, type ActivityPeriod, type ActivityType } from '@/types/dashboard';
import { ArrowLeftRight, BookOpenText, Repeat2, Search, Star, TriangleAlert, UserRound, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

const activityStyles: Record<ActivityType, { icon: LucideIcon; color: string }> = {
    transaction: { icon: ArrowLeftRight, color: 'text-info' },
    client: { icon: UserRound, color: 'text-success' },
    reassignment: { icon: Repeat2, color: 'text-violet-500' },
    risk: { icon: TriangleAlert, color: 'text-danger' },
    knowledge: { icon: BookOpenText, color: 'text-cyan-600' },
    feedback: { icon: Star, color: 'text-warning' },
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

        return periodActivities.filter((activity) => `${activity.title} ${activity.description}`.toLowerCase().includes(keyword));
    }, [activities, period, searchTerm]);

    return (
        <div className="flex h-full flex-col gap-3">
            <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} label="Activity period" />
            <Input
                type="search"
                placeholder="Search activities"
                aria-label="Search activities"
                leadingIcon={<Search />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
            />
            <p className="text-ink-muted border-line border-b pb-3 text-xs">
                <span className="text-ink text-base font-semibold">{visibleActivities.length}</span> new activities {periodLabels[period]}
            </p>

            {visibleActivities.length === 0 ? (
                <p className="text-ink-subtle py-8 text-center text-sm">No activities found.</p>
            ) : (
                <ul className="space-y-4">
                    {visibleActivities.map((activity) => {
                        const style = activityStyles[activity.type];
                        const Icon = style.icon;

                        return (
                            <li key={activity.id} className="flex gap-3">
                                <span className="border-line bg-surface shadow-panel rounded-field flex size-8 shrink-0 items-center justify-center border">
                                    <Icon className={cn('size-4', style.color)} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-2">
                                        <p className="text-ink truncate text-[13px] font-medium">{activity.title}</p>
                                        <time className="text-ink-subtle shrink-0 text-[11px]">{activity.time}</time>
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

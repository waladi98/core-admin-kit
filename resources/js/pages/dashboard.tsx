import { ActivityFeed } from '@/components/admin/activity-feed';
import { LazyTrendChart } from '@/components/admin/lazy-charts';
import { PeriodSelect, reportingPeriodOptions, type ReportingPeriod } from '@/components/admin/period-select';
import { ListSkeleton } from '@/components/admin/skeletons';
import { StatCard } from '@/components/admin/stat-card';
import { TopbarActions } from '@/components/admin/topbar-actions';
import { TransactionTable } from '@/components/admin/transaction-table';
import { TrendBadge } from '@/components/admin/trend-badge';
import { FadeIn, Grid, IconButton, Panel, Skeleton, type BreadcrumbEntry } from '@/components/core';
import { useReloading } from '@/hooks/use-reloading';
import AdminLayout from '@/layouts/admin-layout';
import { formatNumber } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { type SharedData } from '@/types';
import { type Activity, type ActivityPeriod, type StatMetric, type TransactionRow, type VolumeTrend } from '@/types/dashboard';
import { Deferred, Head, router } from '@inertiajs/react';
import { ArrowLeftRight, BadgeCheck, ChartColumn, LayoutGrid, MoreVertical, Newspaper, ShieldAlert, Wallet, type LucideIcon } from 'lucide-react';
import { type ReactElement } from 'react';

interface DashboardProps {
    filters: { period: ReportingPeriod; trendPeriod: ReportingPeriod };
    stats: StatMetric[];
    volumeTrend: VolumeTrend;
    activities?: Record<ActivityPeriod, Activity[]>;
    transactions?: TransactionRow[];
}

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { title: 'Dashboard', href: '/dashboard' },
];

const statIcons: Record<string, LucideIcon> = {
    current_balance: Wallet,
    daily_transactions: ArrowLeftRight,
    compliance_rate: BadgeCheck,
};

function ActivityFeedSkeleton() {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
            </div>
            <Skeleton className="h-9" />
            <Skeleton shape="text" className="h-4 w-1/2" />
            <ListSkeleton rows={6} className="border-line border-t pt-3" />
        </div>
    );
}

export default function Dashboard({ filters, stats, volumeTrend, activities, transactions }: DashboardProps) {
    const isStatsReloading = useReloading(['stats']);
    const isTrendReloading = useReloading(['volumeTrend']);

    const applyFilters = (changes: Partial<DashboardProps['filters']>, only: string[]) => {
        const nextFilters = { ...filters, ...changes };

        router.get(
            route('dashboard'),
            { period: nextFilters.period, trend_period: nextFilters.trendPeriod },
            { only: ['filters', ...only], preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={__('Dashboard')} />

            <TopbarActions>
                <PeriodSelect options={reportingPeriodOptions} value={filters.period} onChange={(period) => applyFilters({ period }, ['stats'])} />
                <IconButton label={__('More options')} variant="secondary">
                    <MoreVertical />
                </IconButton>
            </TopbarActions>

            <Grid stagger>
                {stats.map((metric, index) => (
                    <Grid.Item key={metric.key} span={{ base: 12, md: index === 2 ? 12 : 6, xl: 3 }}>
                        <StatCard metric={metric} icon={statIcons[metric.key]} isLoading={isStatsReloading} />
                    </Grid.Item>
                ))}

                {/* contain:size keeps the feed from stretching the grid row; it scrolls inside instead. */}
                <Grid.Item span={{ base: 12, xl: 3 }} rowSpan={{ xl: 2 }} className="xl:[contain:size]">
                    <Panel>
                        <Panel.Header title="Latest Updates" trailingIcon={Newspaper} />
                        <Panel.Body className="flex flex-col">
                            <Deferred data="activities" fallback={<ActivityFeedSkeleton />}>
                                <FadeIn variant="fade" className="flex min-h-0 flex-1 flex-col">
                                    <ActivityFeed activities={activities ?? { today: [], yesterday: [], this_week: [] }} />
                                </FadeIn>
                            </Deferred>
                        </Panel.Body>
                    </Panel>
                </Grid.Item>

                <Grid.Item span={{ base: 12, xl: 9 }}>
                    <Panel isLoading={isTrendReloading}>
                        <Panel.Header
                            title="Transaction Volume Trend"
                            icon={ChartColumn}
                            actions={
                                <PeriodSelect
                                    options={reportingPeriodOptions}
                                    value={filters.trendPeriod}
                                    onChange={(trendPeriod) => applyFilters({ trendPeriod }, ['volumeTrend'])}
                                />
                            }
                        />
                        <Panel.Body>
                            <div className="flex items-baseline gap-3">
                                <p className="text-ink text-2xl font-semibold tracking-tight">{formatNumber(volumeTrend.total)}</p>
                                <TrendBadge change={volumeTrend.change} />
                            </div>
                            {/* Height follows the screen so stats + chart fit one viewport on desktop. */}
                            <LazyTrendChart
                                key={filters.trendPeriod}
                                points={volumeTrend.points}
                                highlightIndex={volumeTrend.highlightIndex}
                                className="mt-3 h-[clamp(11rem,calc(100dvh-22rem),18rem)]"
                            />
                        </Panel.Body>
                    </Panel>
                </Grid.Item>

                <Grid.Item>
                    <Deferred
                        data="transactions"
                        fallback={<TransactionTable title="Transaction Monitoring" icon={ShieldAlert} rows={[]} isLoading />}
                    >
                        <FadeIn variant="fade">
                            <TransactionTable title="Transaction Monitoring" icon={ShieldAlert} rows={transactions ?? []} />
                        </FadeIn>
                    </Deferred>
                </Grid.Item>
            </Grid>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Dashboard.layout = (page: ReactElement<SharedData>) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Hello, :name 👋" titleParams={{ name: page.props.auth.user.name }}>
        {page}
    </AdminLayout>
);

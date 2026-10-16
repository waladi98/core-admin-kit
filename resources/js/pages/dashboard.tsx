import { ActivityFeed } from '@/components/admin/activity-feed';
import { LazyTrendChart } from '@/components/admin/lazy-charts';
import { PageHeader } from '@/components/admin/page-header';
import { PeriodSelect, reportingPeriodOptions, type ReportingPeriod } from '@/components/admin/period-select';
import { ListSkeleton } from '@/components/admin/skeletons';
import { StatCard } from '@/components/admin/stat-card';
import { TransactionTable } from '@/components/admin/transaction-table';
import { TrendBadge } from '@/components/admin/trend-badge';
import { FadeIn, Grid, IconButton, Panel, Skeleton, type BreadcrumbEntry } from '@/components/core';
import { useReloading } from '@/hooks/use-reloading';
import AdminLayout from '@/layouts/admin-layout';
import { type SharedData } from '@/types';
import { type Activity, type ActivityPeriod, type StatMetric, type TransactionRow, type VolumeTrend } from '@/types/dashboard';
import { Deferred, Head, router, usePage } from '@inertiajs/react';
import { ArrowLeftRight, BadgeCheck, ChartColumn, LayoutGrid, MoreVertical, Newspaper, ShieldAlert, Wallet, type LucideIcon } from 'lucide-react';

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

const numberFormatter = new Intl.NumberFormat('en-US');

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
    const { auth } = usePage<SharedData>().props;
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
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-6">
                <PageHeader
                    title={`Hello, ${auth.user.name} 👋`}
                    description="Here are the latest insights from your finance operations."
                    actions={
                        <>
                            <PeriodSelect
                                options={reportingPeriodOptions}
                                value={filters.period}
                                onChange={(period) => applyFilters({ period }, ['stats'])}
                            />
                            <IconButton label="More options" variant="secondary">
                                <MoreVertical />
                            </IconButton>
                        </>
                    }
                />

                <Grid stagger>
                    {stats.map((metric, index) => (
                        <Grid.Item key={metric.key} span={{ base: 12, md: index === 2 ? 12 : 6, xl: 3 }}>
                            <StatCard metric={metric} icon={statIcons[metric.key]} isLoading={isStatsReloading} />
                        </Grid.Item>
                    ))}

                    <Grid.Item span={{ base: 12, xl: 3 }} rowSpan={{ xl: 2 }}>
                        <Panel>
                            <Panel.Header title="Latest Updates" trailingIcon={Newspaper} />
                            <Panel.Body>
                                <Deferred data="activities" fallback={<ActivityFeedSkeleton />}>
                                    <FadeIn variant="fade" className="h-full">
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
                                    <p className="text-ink text-3xl font-semibold tracking-tight">{numberFormatter.format(volumeTrend.total)}</p>
                                    <TrendBadge change={volumeTrend.change} />
                                </div>
                                <LazyTrendChart
                                    key={filters.trendPeriod}
                                    points={volumeTrend.points}
                                    highlightIndex={volumeTrend.highlightIndex}
                                    className="mt-4 h-64 sm:h-72"
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
            </div>
        </AdminLayout>
    );
}

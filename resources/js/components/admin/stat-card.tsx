import { Panel } from '@/components/core';
import { type StatMetric } from '@/types/dashboard';
import { type LucideIcon } from 'lucide-react';
import { LazySparkline } from './lazy-charts';
import { TrendBadge } from './trend-badge';

export interface StatCardProps {
    metric: StatMetric;
    icon?: LucideIcon;
    isLoading?: boolean;
}

export function StatCard({ metric, icon, isLoading = false }: StatCardProps) {
    return (
        <Panel isLoading={isLoading}>
            <Panel.Header title={metric.label} trailingIcon={icon} />
            <Panel.Body className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-ink text-2xl font-semibold tracking-tight">{metric.value}</p>
                    <TrendBadge change={metric.change} className="mt-1" />
                </div>
                <LazySparkline data={metric.trend} tone={metric.change >= 0 ? 'success' : 'danger'} className="h-12 w-24 shrink-0" />
            </Panel.Body>
        </Panel>
    );
}

import { Skeleton } from '@/components/core';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './error-boundary';
import { ChartSkeleton } from './skeletons';
import { type SparklineProps } from './sparkline';
import { type TrendChartProps } from './trend-chart';

/**
 * Recharts is large, so charts load in a separate chunk after the page shell renders.
 */
const Sparkline = lazy(() => import('./sparkline').then((module) => ({ default: module.Sparkline })));
const TrendChart = lazy(() => import('./trend-chart').then((module) => ({ default: module.TrendChart })));

export function LazySparkline(props: SparklineProps) {
    return (
        <ErrorBoundary className={props.className}>
            <Suspense fallback={<Skeleton className={props.className} />}>
                <Sparkline {...props} />
            </Suspense>
        </ErrorBoundary>
    );
}

export function LazyTrendChart(props: TrendChartProps) {
    return (
        <ErrorBoundary className={props.className}>
            <Suspense fallback={<ChartSkeleton className={props.className} />}>
                <TrendChart {...props} />
            </Suspense>
        </ErrorBoundary>
    );
}

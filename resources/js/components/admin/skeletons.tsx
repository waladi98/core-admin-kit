import { Skeleton } from '@/components/core';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Loading placeholders shaped like the admin widgets, reusable across modules.
 */

export interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    /** Renders a checkbox column first, matching selectable tables. */
    hasSelection?: boolean;
    className?: string;
}

const cellWidths = ['w-16', 'w-40', 'w-20', 'w-28', 'w-24', 'w-20', 'w-14'];

export function TableSkeleton({ rows = 5, columns = 6, hasSelection = false, className }: TableSkeletonProps) {
    return (
        <div className={cn('w-full', className)} aria-busy="true" aria-label={__('Loading table')}>
            <div className="bg-surface-muted/60 border-line flex h-10 items-center gap-6 border-b px-3">
                {hasSelection && <Skeleton className="size-4 shrink-0" />}
                {Array.from({ length: columns }, (_, column) => (
                    <Skeleton key={column} shape="text" className={cn('h-2.5', cellWidths[column % cellWidths.length])} />
                ))}
            </div>
            {Array.from({ length: rows }, (_, row) => (
                <div key={row} className="border-line flex h-12 items-center gap-6 border-b px-3 last:border-0">
                    {hasSelection && <Skeleton className="size-4 shrink-0" />}
                    {Array.from({ length: columns }, (_, column) => (
                        <span key={column} className={cn('flex items-center gap-2', cellWidths[column % cellWidths.length])}>
                            {column === 3 && <Skeleton shape="circle" className="size-6 shrink-0" />}
                            <Skeleton shape="text" className="w-full" />
                        </span>
                    ))}
                </div>
            ))}
        </div>
    );
}

export interface ListSkeletonProps {
    rows?: number;
    className?: string;
}

export function ListSkeleton({ rows = 5, className }: ListSkeletonProps) {
    return (
        <ul className={cn('space-y-4', className)} aria-busy="true" aria-label={__('Loading list')}>
            {Array.from({ length: rows }, (_, row) => (
                <li key={row} className="flex gap-3">
                    <Skeleton className="size-8 shrink-0" />
                    <div className="flex flex-1 flex-col gap-2 pt-1">
                        <div className="flex justify-between gap-4">
                            <Skeleton shape="text" className="w-1/2" />
                            <Skeleton shape="text" className="w-10" />
                        </div>
                        <Skeleton shape="text" className="w-4/5" />
                    </div>
                </li>
            ))}
        </ul>
    );
}

const barHeights = ['45%', '60%', '80%', '55%', '95%', '70%', '40%'];

export function ChartSkeleton({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-end gap-[3%] pr-12 pb-6', className)} aria-busy="true" aria-label={__('Loading chart')}>
            {barHeights.map((height, index) => (
                <Skeleton key={index} className="flex-1 rounded-t-md rounded-b-none" style={{ height }} />
            ))}
        </div>
    );
}

import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface TrendBadgeProps {
    change: number;
    suffix?: string;
    className?: string;
}

export function formatChange(change: number): string {
    const sign = change > 0 ? '+' : '';

    return `${sign}${change}%`;
}

export function TrendBadge({ change, suffix = 'vs last week', className }: TrendBadgeProps) {
    return (
        <span className={cn('inline-flex items-center gap-1.5 text-xs', className)}>
            <span className={cn('font-medium', change >= 0 ? 'text-success' : 'text-danger')}>{formatChange(change)}</span>
            {suffix && <span className="text-ink-muted">{__(suffix)}</span>}
        </span>
    );
}

import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type TransactionPriority } from '@/types/dashboard';

const priorityConfig: Record<TransactionPriority, { label: string; level: number; color: string }> = {
    high: { label: 'High', level: 3, color: 'bg-danger' },
    medium: { label: 'Medium', level: 2, color: 'bg-warning' },
    low: { label: 'Low', level: 1, color: 'bg-warning/60' },
};

export function PriorityBadge({ priority }: { priority: TransactionPriority }) {
    const config = priorityConfig[priority];

    return (
        <span className="text-ink-soft inline-flex items-center gap-2">
            <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                {[1, 2, 3].map((bar) => (
                    <span
                        key={bar}
                        className={cn('w-[3px] rounded-[1px]', bar <= config.level ? config.color : 'bg-line-strong')}
                        style={{ height: `${bar * 4}px` }}
                    />
                ))}
            </span>
            {__(config.label)}
        </span>
    );
}

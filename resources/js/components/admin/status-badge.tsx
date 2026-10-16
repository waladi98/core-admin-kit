import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type TransactionStatus } from '@/types/dashboard';
import { CircleAlert, CircleCheck, Clock3, FileSearch, type LucideIcon } from 'lucide-react';

export const statusConfig: Record<TransactionStatus, { label: string; icon: LucideIcon; color: string }> = {
    in_review: { label: 'In Review', icon: FileSearch, color: 'text-info' },
    completed: { label: 'Completed', icon: CircleCheck, color: 'text-success' },
    in_progress: { label: 'In Progress', icon: Clock3, color: 'text-warning' },
    overdue: { label: 'Overdue', icon: CircleAlert, color: 'text-danger' },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <span className="text-ink-soft inline-flex items-center gap-2">
            <Icon className={cn('size-4 shrink-0', config.color)} aria-hidden="true" />
            {__(config.label)}
        </span>
    );
}

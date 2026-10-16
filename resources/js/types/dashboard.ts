export interface StatMetric {
    key: string;
    label: string;
    value: string;
    /** Percentage change compared to the previous period, e.g. 7.1 or -1.3. */
    change: number;
    trend: number[];
}

export interface TrendPoint {
    label: string;
    value: number;
}

export interface VolumeTrend {
    total: number;
    change: number;
    points: TrendPoint[];
    /** Index of the bar that is highlighted by default. */
    highlightIndex?: number;
}

export type ActivityType = 'transaction' | 'client' | 'reassignment' | 'risk' | 'knowledge' | 'feedback';

export type ActivityPeriod = 'today' | 'yesterday' | 'this_week';

export interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    time: string;
}

export type TransactionPriority = 'high' | 'medium' | 'low';

export type TransactionStatus = 'in_review' | 'completed' | 'in_progress' | 'overdue';

export interface TransactionRow {
    id: string;
    reference: string;
    subject: string;
    priority: TransactionPriority;
    assignee: { name: string; avatar?: string | null };
    status: TransactionStatus;
    createdAt: string;
    dueIn: string;
}

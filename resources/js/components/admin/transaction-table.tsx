import {
    Avatar,
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownSeparator,
    DropdownTrigger,
    Input,
    Panel,
    buttonVariants,
    iconButtonVariants,
} from '@/components/core';
import { cn } from '@/lib/utils';
import { type TransactionPriority, type TransactionRow, type TransactionStatus } from '@/types/dashboard';
import { Check, Download, Eye, Filter, MoreVertical, Pencil, Search, UserRoundPlus, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DataTable, type DataTableColumn } from './data-table';
import { PriorityBadge } from './priority-badge';
import { StatusBadge, statusConfig } from './status-badge';

const priorityRank: Record<TransactionPriority, number> = { high: 3, medium: 2, low: 1 };

const columns: DataTableColumn<TransactionRow>[] = [
    {
        key: 'reference',
        header: 'Transaction ID',
        cell: (row) => <span className="text-ink font-medium">{row.reference}</span>,
        sortValue: (row) => row.reference,
    },
    { key: 'subject', header: 'Subject', cell: (row) => row.subject, sortValue: (row) => row.subject, className: 'w-full min-w-56' },
    {
        key: 'priority',
        header: 'Priority',
        cell: (row) => <PriorityBadge priority={row.priority} />,
        skeleton: 'badge',
        sortValue: (row) => priorityRank[row.priority],
    },
    {
        key: 'assignee',
        header: 'Assigned To',
        cell: (row) => (
            <span className="inline-flex items-center gap-2">
                <Avatar name={row.assignee.name} src={row.assignee.avatar} size="sm" />
                {row.assignee.name}
            </span>
        ),
        sortValue: (row) => row.assignee.name,
        skeleton: 'avatar',
    },
    {
        key: 'status',
        header: 'Status',
        cell: (row) => <StatusBadge status={row.status} />,
        skeleton: 'badge',
        sortValue: (row) => statusConfig[row.status].label,
    },
    { key: 'createdAt', header: 'Created Date', cell: (row) => row.createdAt, sortValue: (row) => row.createdAt },
    { key: 'dueIn', header: 'Due', cell: (row) => row.dueIn },
];

const statusFilters = Object.entries(statusConfig) as [TransactionStatus, (typeof statusConfig)[TransactionStatus]][];

function RowActions({ row }: { row: TransactionRow }) {
    return (
        <Dropdown>
            <DropdownTrigger aria-label={`Actions for ${row.reference}`} className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}>
                <MoreVertical />
            </DropdownTrigger>
            <DropdownContent>
                <DropdownItem icon={<Eye />}>View details</DropdownItem>
                <DropdownItem icon={<Pencil />}>Edit</DropdownItem>
                <DropdownItem icon={<UserRoundPlus />}>Reassign</DropdownItem>
            </DropdownContent>
        </Dropdown>
    );
}

export interface TransactionTableProps {
    title: string;
    icon?: LucideIcon;
    rows: TransactionRow[];
    /** Shows skeleton rows, e.g. while deferred props load. */
    isLoading?: boolean;
}

export function TransactionTable({ title, icon, rows, isLoading = false }: TransactionTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<TransactionStatus | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const filteredRows = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return rows.filter((row) => {
            const matchesStatus = statusFilter === null || row.status === statusFilter;
            const matchesKeyword = !keyword || `${row.reference} ${row.subject} ${row.assignee.name}`.toLowerCase().includes(keyword);

            return matchesStatus && matchesKeyword;
        });
    }, [rows, searchTerm, statusFilter]);

    const toolbar = (
        <>
            <Input
                type="search"
                placeholder="Transaction"
                aria-label="Search transactions"
                leadingIcon={<Search />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                wrapperClassName="h-8 w-40 sm:w-56"
            />
            <Dropdown>
                <DropdownTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), statusFilter && 'border-brand')}>
                    <Filter />
                    <span className="hidden sm:inline">{statusFilter ? statusConfig[statusFilter].label : 'Filter'}</span>
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownLabel>Status</DropdownLabel>
                    <DropdownItem onSelect={() => setStatusFilter(null)} icon={statusFilter === null ? <Check /> : <span className="size-4" />}>
                        All statuses
                    </DropdownItem>
                    <DropdownSeparator />
                    {statusFilters.map(([status, config]) => (
                        <DropdownItem
                            key={status}
                            onSelect={() => setStatusFilter(status)}
                            icon={statusFilter === status ? <Check /> : <span className="size-4" />}
                        >
                            {config.label}
                        </DropdownItem>
                    ))}
                </DropdownContent>
            </Dropdown>
            <Dropdown>
                <DropdownTrigger aria-label="More table actions" className={iconButtonVariants({ variant: 'secondary', size: 'md' })}>
                    <MoreVertical />
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownItem icon={<Download />}>Export CSV</DropdownItem>
                    <DropdownItem icon={<UserRoundPlus />} disabled={selectedIds.length === 0}>
                        Reassign selected ({selectedIds.length})
                    </DropdownItem>
                </DropdownContent>
            </Dropdown>
        </>
    );

    return (
        <Panel>
            <Panel.Header title={title} icon={icon} actions={toolbar} />
            <Panel.Body padding="none" className="overflow-hidden">
                <DataTable
                    rows={filteredRows}
                    columns={columns}
                    getRowId={(row) => row.id}
                    selectable
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    rowActions={(row) => <RowActions row={row} />}
                    isLoading={isLoading}
                    skeletonRows={4}
                    emptyState={
                        <>
                            <p className="text-ink text-sm font-medium">No transactions found</p>
                            <p className="text-ink-muted text-sm">Try a different keyword or status.</p>
                            {(searchTerm || statusFilter) && (
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter(null);
                                    }}
                                >
                                    Reset filters
                                </Button>
                            )}
                        </>
                    }
                />
            </Panel.Body>
        </Panel>
    );
}

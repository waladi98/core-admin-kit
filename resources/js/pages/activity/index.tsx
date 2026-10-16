import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import {
    Avatar,
    Badge,
    FilterTabs,
    Input,
    Modal,
    Pagination,
    Panel,
    Tooltip,
    iconButtonVariants,
    type BadgeProps,
    type BreadcrumbEntry,
} from '@/components/core';
import { useTableQuery } from '@/hooks/use-table-query';
import AdminLayout from '@/layouts/admin-layout';
import { formatDateTime, formatRelative } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { History, LoaderCircle, Search, SquareArrowOutUpRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface ActivityEntry {
    id: number;
    event: string;
    description: string;
    subjectType: string | null;
    subjectLabel: string | null;
    causer: { name: string; avatar: string | null } | null;
    properties: {
        changes?: Record<string, { old: unknown; new: unknown }>;
        added?: string[];
        removed?: string[];
    };
    ipAddress: string | null;
    createdAt: string;
}

interface ActivityIndexProps {
    logs: {
        data: ActivityEntry[];
        currentPage: number;
        lastPage: number;
        perPage: number;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string | null; event: string | null; perPage: number };
    eventCounts: Record<string, number>;
}

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Activity log', href: '/activity', icon: History }];

const eventTones: Record<string, BadgeProps['tone']> = {
    created: 'success',
    updated: 'info',
    deleted: 'danger',
    changed: 'warning',
    signed_in: 'neutral',
    signed_out: 'neutral',
};

const eventLabels: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    changed: 'Changed',
    signed_in: 'Signed in',
    signed_out: 'Signed out',
};

function hasDetails(entry: ActivityEntry): boolean {
    return Boolean(entry.properties.changes || entry.properties.added?.length || entry.properties.removed?.length);
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return '—';
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export default function ActivityIndex({ logs, filters, eventCounts }: ActivityIndexProps) {
    const [selected, setSelected] = useState<ActivityEntry | null>(null);

    const table = useTableQuery<{ event: string | null }>({
        url: route('activity.index'),
        only: ['logs', 'filters', 'eventCounts'],
        initial: { search: filters.search ?? '', sort: null, page: logs.currentPage, perPage: filters.perPage, filters: { event: filters.event } },
    });

    const columns: DataTableColumn<ActivityEntry>[] = [
        {
            key: 'when',
            header: 'When',
            cell: (entry) => (
                <Tooltip content={formatDateTime(entry.createdAt)}>
                    <span className="tabular-nums">{formatRelative(entry.createdAt)}</span>
                </Tooltip>
            ),
        },
        {
            key: 'causer',
            header: 'User',
            skeleton: 'avatar',
            cell: (entry) =>
                entry.causer ? (
                    <span className="inline-flex items-center gap-2">
                        <Avatar name={entry.causer.name} src={entry.causer.avatar} size="sm" />
                        {entry.causer.name}
                    </span>
                ) : (
                    <span className="text-ink-muted">{__('System')}</span>
                ),
        },
        {
            key: 'event',
            header: 'Event',
            skeleton: 'badge',
            cell: (entry) => (
                <Badge shape="pill" tone={eventTones[entry.event] ?? 'neutral'}>
                    {__(eventLabels[entry.event] ?? entry.event)}
                </Badge>
            ),
        },
        {
            key: 'description',
            header: 'Activity',
            className: 'w-full min-w-56',
            cell: (entry) => (
                <span>
                    <span className="text-ink">{__(entry.description)}</span>
                    {entry.subjectLabel && <span className="text-ink-muted"> · {__(entry.subjectLabel)}</span>}
                </span>
            ),
        },
        { key: 'ip', header: 'IP address', cell: (entry) => <span className="text-ink-muted tabular-nums">{entry.ipAddress ?? '—'}</span> },
    ];

    const tabs = [
        { value: 'all', label: 'All', count: eventCounts.all },
        ...Object.entries(eventLabels).map(([value, label]) => ({ value, label, count: eventCounts[value] ?? 0 })),
    ];

    return (
        <>
            <Panel fill>
                <Panel.Header
                    title="Activity log"
                    icon={History}
                    actions={
                        <Input
                            type="search"
                            placeholder={__('Search activity, record or user…')}
                            aria-label={__('Search activity')}
                            leadingIcon={table.isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                            value={table.query.search}
                            onChange={(event) => table.setSearch(event.target.value)}
                            wrapperClassName="h-8 w-48 sm:w-72"
                        />
                    }
                />
                <Panel.Toolbar>
                    <FilterTabs
                        label="Filter by event"
                        options={tabs}
                        value={table.query.filters.event ?? 'all'}
                        onChange={(event) => table.setFilter('event', event === 'all' ? null : event)}
                    />
                </Panel.Toolbar>
                <Panel.Body padding="none" className="flex flex-col">
                    <DataTable
                        stickyHeader
                        rows={logs.data}
                        columns={columns}
                        getRowId={(entry) => String(entry.id)}
                        isLoading={table.isLoading}
                        emptyMessage="No activity recorded yet."
                        rowActions={(entry) =>
                            hasDetails(entry) ? (
                                <button
                                    type="button"
                                    onClick={() => setSelected(entry)}
                                    aria-label={__('Show details')}
                                    title={__('Show details')}
                                    className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}
                                >
                                    <SquareArrowOutUpRight />
                                </button>
                            ) : null
                        }
                        mobileCard={(entry) => (
                            <div className="space-y-1">
                                <p className="text-ink text-sm">
                                    {__(entry.description)}
                                    {entry.subjectLabel && <span className="text-ink-muted"> · {__(entry.subjectLabel)}</span>}
                                </p>
                                <p className="text-ink-muted text-xs">
                                    {entry.causer?.name ?? __('System')} · {formatRelative(entry.createdAt)}
                                </p>
                            </div>
                        )}
                    />
                    <div className="border-line shrink-0 border-t px-3 py-2">
                        <Pagination
                            currentPage={logs.currentPage}
                            lastPage={logs.lastPage}
                            onPageChange={table.setPage}
                            loadingPage={table.loadingPage}
                            from={logs.from}
                            to={logs.to}
                            total={logs.total}
                            perPage={table.query.perPage ?? logs.perPage}
                            onPerPageChange={table.setPerPage}
                        />
                    </div>
                </Panel.Body>
            </Panel>

            <Modal
                isOpen={selected !== null}
                onClose={() => setSelected(null)}
                title={selected ? __(selected.description) : ''}
                description={selected ? `${selected.causer?.name ?? __('System')} · ${formatDateTime(selected.createdAt)}` : undefined}
                size="lg"
            >
                {selected?.properties.changes && (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-ink-muted border-line border-b text-left text-xs">
                                <th className="py-2 pr-3 font-medium">{__('Field')}</th>
                                <th className="py-2 pr-3 font-medium">{__('Before')}</th>
                                <th className="py-2 font-medium">{__('After')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(selected.properties.changes).map(([field, change]) => (
                                <tr key={field} className="border-line border-b last:border-0">
                                    <td className="text-ink-soft py-2 pr-3 font-medium">{field}</td>
                                    <td className="text-ink-muted py-2 pr-3 break-all">{formatValue(change.old)}</td>
                                    <td className="text-ink py-2 break-all">{formatValue(change.new)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {(selected?.properties.added?.length || selected?.properties.removed?.length) && (
                    <div className="space-y-3 text-sm">
                        {Boolean(selected?.properties.added?.length) && (
                            <div>
                                <p className="text-success mb-1 text-xs font-medium">{__('Permissions added')}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selected?.properties.added?.map((name) => (
                                        <Badge key={name} tone="success">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {Boolean(selected?.properties.removed?.length) && (
                            <div>
                                <p className="text-danger mb-1 text-xs font-medium">{__('Permissions removed')}</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selected?.properties.removed?.map((name) => (
                                        <Badge key={name} tone="danger">
                                            {name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
ActivityIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

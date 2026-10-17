import { Can } from '@/components/admin/can';
import { ColumnToggle } from '@/components/admin/column-toggle';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { VendorQuickForm } from '@/components/admin/vendor-quick-form';
import {
    Badge,
    Button,
    buttonVariants,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownSeparator,
    DropdownTrigger,
    FilterTabs,
    iconButtonVariants,
    Input,
    Pagination,
    Panel,
    useConfirm,
    type BadgeProps,
    type BreadcrumbEntry,
    type FilterTabOption,
} from '@/components/core';
import { usePermissions } from '@/hooks/use-can';
import { useColumnVisibility } from '@/hooks/use-column-visibility';
import { useTableQuery } from '@/hooks/use-table-query';
import AdminLayout from '@/layouts/admin-layout';
import { formatCurrency, formatDate } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type TableSort } from '@/types/table';
import { type Vendor, type VendorIndexProps, type VendorStatus } from '@/types/vendor';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Check,
    Eye,
    Filter,
    LoaderCircle,
    MoreHorizontal,
    Pencil,
    PencilLine,
    Plus,
    Power,
    PowerOff,
    Search,
    Trash2,
    TriangleAlert,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Vendors', href: '/vendors', icon: Building2 }];

const statusTones: Record<VendorStatus, BadgeProps['tone']> = {
    active: 'success',
    inactive: 'neutral',
};

const columns: DataTableColumn<Vendor>[] = [
    {
        key: 'name',
        header: 'Vendor',
        sortable: true,
        hideable: false,
        className: 'w-full min-w-56',
        cell: (vendor) => (
            <span className="block min-w-0">
                {/* The name opens the detail page (a real page: shareable link, browser Back works). */}
                <Link href={route('vendors.show', vendor.id)} prefetch className="text-ink font-medium hover:underline hover:underline-offset-4">
                    {vendor.name}
                </Link>
                <span className="text-ink-subtle block text-xs">{vendor.code}</span>
            </span>
        ),
    },
    {
        key: 'category',
        header: 'Category',
        skeleton: 'badge',
        cell: (vendor) => <Badge shape="pill">{vendor.categoryLabel}</Badge>,
    },
    {
        key: 'contact',
        header: 'Contact',
        cell: (vendor) => (
            <span className="block min-w-0">
                <span className="text-ink-soft block truncate">{vendor.email ?? '—'}</span>
                {vendor.phone && <span className="text-ink-subtle block text-xs">{vendor.phone}</span>}
            </span>
        ),
    },
    {
        key: 'credit_limit',
        header: 'Credit limit',
        sortable: true,
        className: 'text-right',
        cell: (vendor) => <span className="tabular-nums">{formatCurrency(vendor.creditLimit)}</span>,
    },
    {
        key: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (vendor) => (
            <span className="inline-flex flex-wrap items-center gap-1.5">
                <Badge shape="pill" tone={statusTones[vendor.status]}>
                    {vendor.statusLabel}
                </Badge>
                {vendor.isIncomplete && (
                    <Badge shape="pill" tone="warning">
                        <TriangleAlert className="size-3" /> {__('Incomplete')}
                    </Badge>
                )}
            </span>
        ),
    },
    { key: 'created_at', header: 'Added', sortable: true, cell: (vendor) => formatDate(vendor.createdAt) },
];

type StatusTab = 'all' | VendorStatus;

/** Parses the server sort (`name` or `-name`) into the table sort state. */
function parseSort(sort: string): TableSort {
    return sort.startsWith('-') ? { key: sort.slice(1), direction: 'desc' } : { key: sort, direction: 'asc' };
}

/**
 * Vendors list. Mixed pattern: quick add / quick edit open a modal here,
 * the full form and the details are separate pages.
 */
export default function VendorsIndex({ vendors, filters, statusCounts, categoryOptions }: VendorIndexProps) {
    const can = usePermissions();
    const canEdit = can('vendors.update');
    const canDelete = can('vendors.delete');
    const confirm = useConfirm();
    const [pendingIds, setPendingIds] = useState<string[]>([]);
    const columnVisibility = useColumnVisibility('vendors', columns);

    // Quick add (vendor null) or quick edit. The vendor is kept while the modal closes so its title does not flip.
    const [quickForm, setQuickForm] = useState<{ isOpen: boolean; vendor: Vendor | null }>({ isOpen: false, vendor: null });
    const openQuickForm = (vendor: Vendor | null) => setQuickForm({ isOpen: true, vendor });

    // "Add vendor" from the command palette links to /vendors?create=1 and opens the modal straight away.
    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('create') && can('vendors.create')) {
            openQuickForm(null);
        }
    }, [can]);

    const table = useTableQuery<{ category: string | null; status: string | null }>({
        url: route('vendors.index'),
        only: ['vendors', 'filters', 'statusCounts'],
        initial: {
            search: filters.search ?? '',
            sort: parseSort(filters.sort),
            page: vendors.currentPage,
            perPage: filters.perPage,
            filters: { category: filters.category, status: filters.status },
        },
    });

    const activeCategory = table.query.filters.category;
    const statusTabs: FilterTabOption<StatusTab>[] = [
        { value: 'all', label: 'All', count: statusCounts.all },
        { value: 'active', label: 'Active', count: statusCounts.active },
        { value: 'inactive', label: 'Inactive', count: statusCounts.inactive },
    ];

    /** Row requests (status, delete): the row shows as pending until the request ends. */
    const visitRow = (vendor: Vendor, method: 'patch' | 'delete', url: string) => {
        const rowId = String(vendor.id);

        router.visit(url, {
            method,
            preserveScroll: true,
            preserveState: true,
            only: ['vendors', 'statusCounts'],
            onStart: () => setPendingIds((ids) => [...ids, rowId]),
            onFinish: () => setPendingIds((ids) => ids.filter((id) => id !== rowId)),
        });
    };

    const deleteVendor = async (vendor: Vendor) => {
        const confirmed = await confirm({
            title: 'Delete this vendor?',
            description: __(':name (:code) will be removed. This cannot be undone.', { name: vendor.name, code: vendor.code }),
            confirmLabel: 'Delete vendor',
            tone: 'danger',
        });

        if (confirmed) {
            visitRow(vendor, 'delete', route('vendors.destroy', vendor.id));
        }
    };

    const headerActions = (
        <>
            <Input
                type="search"
                placeholder={__('Search name, email or code…')}
                aria-label={__('Search vendors')}
                leadingIcon={table.isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                value={table.query.search}
                onChange={(event) => table.setSearch(event.target.value)}
                wrapperClassName="h-8 w-48 sm:w-64"
            />
            <Dropdown>
                <DropdownTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), activeCategory && 'border-brand')}>
                    <Filter />
                    {activeCategory ? categoryOptions.find((option) => option.value === activeCategory)?.label : __('Filter')}
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownLabel>{__('Category')}</DropdownLabel>
                    <DropdownItem
                        onSelect={() => table.setFilter('category', null)}
                        icon={activeCategory === null ? <Check /> : <span className="size-4" />}
                    >
                        {__('All categories')}
                    </DropdownItem>
                    <DropdownSeparator />
                    {categoryOptions.map((option) => (
                        <DropdownItem
                            key={option.value}
                            onSelect={() => table.setFilter('category', option.value)}
                            icon={activeCategory === option.value ? <Check /> : <span className="size-4" />}
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownContent>
            </Dropdown>
            <ColumnToggle visibility={columnVisibility} />
            <Can permission="vendors.create">
                <Button size="sm" onClick={() => openQuickForm(null)}>
                    <Plus />
                    {__('Add vendor')}
                </Button>
            </Can>
        </>
    );

    return (
        <>
            <Head title={__('Vendors')} />

            <Panel fill>
                <Panel.Header title="Vendors" icon={Building2} actions={headerActions} />
                <Panel.Toolbar>
                    <FilterTabs
                        label="Filter by status"
                        options={statusTabs}
                        value={(table.query.filters.status as StatusTab | null) ?? 'all'}
                        onChange={(status) => table.setFilter('status', status === 'all' ? null : status)}
                    />
                </Panel.Toolbar>
                <Panel.Body padding="none" className="flex flex-col">
                    <DataTable
                        stickyHeader
                        rows={vendors.data}
                        columns={columnVisibility.visibleColumns}
                        getRowId={(vendor) => String(vendor.id)}
                        rowNumberOffset={(vendors.currentPage - 1) * vendors.perPage}
                        sort={table.query.sort}
                        onSortChange={table.setSort}
                        isLoading={table.isLoading}
                        pendingRowIds={pendingIds}
                        mobileCard={(vendor) => (
                            <div className="space-y-1.5">
                                <Link href={route('vendors.show', vendor.id)} className="text-ink block truncate font-medium">
                                    {vendor.name}
                                </Link>
                                <p className="text-ink-muted truncate text-xs">
                                    {vendor.code} · {vendor.email ?? vendor.phone ?? '—'}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge shape="pill">{vendor.categoryLabel}</Badge>
                                    <Badge shape="pill" tone={statusTones[vendor.status]}>
                                        {vendor.statusLabel}
                                    </Badge>
                                    <span className="text-ink-subtle text-xs tabular-nums">{formatCurrency(vendor.creditLimit)}</span>
                                </div>
                            </div>
                        )}
                        rowActions={(vendor) => (
                            <Dropdown>
                                <DropdownTrigger
                                    aria-label={__('Actions for :name', { name: vendor.name })}
                                    className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}
                                >
                                    <MoreHorizontal />
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem icon={<Eye />} href={route('vendors.show', vendor.id)}>
                                        {__('View details')}
                                    </DropdownItem>
                                    {canEdit && (
                                        <>
                                            {/* Modal: small change, stay on the list. */}
                                            <DropdownItem icon={<PencilLine />} onSelect={() => openQuickForm(vendor)}>
                                                {__('Quick edit')}
                                            </DropdownItem>
                                            {/* Page: the full form. */}
                                            <DropdownItem icon={<Pencil />} href={route('vendors.edit', vendor.id)}>
                                                {__('Edit all details')}
                                            </DropdownItem>
                                            <DropdownItem
                                                icon={vendor.status === 'active' ? <PowerOff /> : <Power />}
                                                onSelect={() => visitRow(vendor, 'patch', route('vendors.toggle-status', vendor.id))}
                                            >
                                                {vendor.status === 'active' ? __('Deactivate') : __('Activate')}
                                            </DropdownItem>
                                        </>
                                    )}
                                    {canDelete && (
                                        <>
                                            <DropdownSeparator />
                                            <DropdownItem icon={<Trash2 />} tone="danger" onSelect={() => deleteVendor(vendor)}>
                                                {__('Delete')}
                                            </DropdownItem>
                                        </>
                                    )}
                                </DropdownContent>
                            </Dropdown>
                        )}
                        emptyState={
                            <>
                                <p className="text-ink text-sm font-medium">{__('No vendors found')}</p>
                                <p className="text-ink-muted text-sm">{__('Try a different keyword, category or status.')}</p>
                                {table.hasActiveFilters && (
                                    <Button variant="secondary" size="sm" className="mt-2" onClick={table.reset}>
                                        {__('Reset filters')}
                                    </Button>
                                )}
                            </>
                        }
                    />
                    <div className="border-line shrink-0 border-t px-3 py-2">
                        <Pagination
                            currentPage={vendors.currentPage}
                            lastPage={vendors.lastPage}
                            onPageChange={table.setPage}
                            loadingPage={table.loadingPage}
                            from={vendors.from}
                            to={vendors.to}
                            total={vendors.total}
                            perPage={table.query.perPage ?? vendors.perPage}
                            onPerPageChange={table.setPerPage}
                        />
                    </div>
                </Panel.Body>
            </Panel>

            <VendorQuickForm
                isOpen={quickForm.isOpen}
                onClose={() => setQuickForm((current) => ({ ...current, isOpen: false }))}
                vendor={quickForm.vendor}
                categoryOptions={categoryOptions}
            />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
VendorsIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

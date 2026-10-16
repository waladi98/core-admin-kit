import { Can } from '@/components/admin/can';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownSeparator,
    DropdownTrigger,
    FilterTabs,
    Input,
    Pagination,
    Panel,
    buttonVariants,
    iconButtonVariants,
    useConfirm,
    type BadgeProps,
    type BreadcrumbEntry,
    type FilterTabOption,
} from '@/components/core';
import { usePermissions } from '@/hooks/use-can';
import { useTableQuery } from '@/hooks/use-table-query';
import AdminLayout from '@/layouts/admin-layout';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type TableSort } from '@/types/table';
import { type ManagedUser, type UserIndexProps, type UserRole, type UserStatus } from '@/types/user-management';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Filter, LoaderCircle, MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Users', href: '/users', icon: Users }];

/** Built-in roles get a color; custom roles use neutral. */
const roleTones: Record<UserRole, BadgeProps['tone']> = {
    admin: 'info',
    manager: 'warning',
    staff: 'neutral',
};

const statusTones: Record<UserStatus, BadgeProps['tone']> = {
    active: 'success',
    inactive: 'neutral',
};

const columns: DataTableColumn<ManagedUser>[] = [
    {
        key: 'name',
        header: 'Name',
        sortable: true,
        skeleton: 'avatar',
        className: 'w-full min-w-48',
        cell: (user) => (
            <span className="inline-flex items-center gap-2">
                <Avatar name={user.name} src={user.avatar} size="sm" />
                <span className="text-ink font-medium">{user.name}</span>
            </span>
        ),
    },
    { key: 'email', header: 'Email', sortable: true, cell: (user) => user.email },
    {
        key: 'role',
        header: 'Role',
        skeleton: 'badge',
        cell: (user) => (
            <Badge shape="pill" tone={roleTones[user.role] ?? 'neutral'}>
                {user.roleLabel}
            </Badge>
        ),
    },
    {
        key: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (user) => (
            <Badge shape="pill" tone={statusTones[user.status]}>
                {user.statusLabel}
            </Badge>
        ),
    },
    { key: 'created_at', header: 'Joined', sortable: true, cell: (user) => user.createdAt },
];

type StatusTab = 'all' | UserStatus;

/** Parses the server sort (`name` or `-name`) into the table sort state. */
function parseSort(sort: string): TableSort {
    return sort.startsWith('-') ? { key: sort.slice(1), direction: 'desc' } : { key: sort, direction: 'asc' };
}

export default function UsersIndex({ users, filters, statusCounts, roleOptions, statusOptions }: UserIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const can = usePermissions();
    const canEdit = can('users.update');
    const canDelete = can('users.delete');
    const confirm = useConfirm();
    const [deletingIds, setDeletingIds] = useState<string[]>([]);

    const table = useTableQuery<{ role: string | null; status: string | null }>({
        url: route('users.index'),
        only: ['users', 'filters', 'statusCounts'],
        initial: {
            search: filters.search ?? '',
            sort: parseSort(filters.sort),
            page: users.currentPage,
            perPage: filters.perPage,
            filters: { role: filters.role, status: filters.status },
        },
    });

    const activeRole = table.query.filters.role;
    const statusTabs: FilterTabOption<StatusTab>[] = [
        { value: 'all', label: 'All', count: statusCounts.all },
        ...statusOptions.map((option) => ({
            value: option.value as UserStatus,
            label: option.label,
            count: statusCounts[option.value as UserStatus],
        })),
    ];

    const deleteUser = async (user: ManagedUser) => {
        const confirmed = await confirm({
            title: 'Delete this user?',
            description: __(':name (:email) will lose access immediately. This cannot be undone.', { name: user.name, email: user.email }),
            confirmLabel: 'Delete user',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        const rowId = String(user.id);

        router.delete(route('users.destroy', user.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['users', 'statusCounts'],
            onStart: () => setDeletingIds((ids) => [...ids, rowId]),
            onFinish: () => setDeletingIds((ids) => ids.filter((id) => id !== rowId)),
        });
    };

    const headerActions = (
        <>
            <Input
                type="search"
                placeholder={__('Search name or email…')}
                aria-label={__('Search users')}
                leadingIcon={table.isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                value={table.query.search}
                onChange={(event) => table.setSearch(event.target.value)}
                wrapperClassName="h-8 w-48 sm:w-64"
            />
            <Dropdown>
                <DropdownTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), activeRole && 'border-brand')}>
                    <Filter />
                    {activeRole ? roleOptions.find((option) => option.value === activeRole)?.label : __('Filter')}
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownLabel>{__('Role')}</DropdownLabel>
                    <DropdownItem onSelect={() => table.setFilter('role', null)} icon={activeRole === null ? <Check /> : <span className="size-4" />}>
                        {__('All roles')}
                    </DropdownItem>
                    <DropdownSeparator />
                    {roleOptions.map((option) => (
                        <DropdownItem
                            key={option.value}
                            onSelect={() => table.setFilter('role', option.value)}
                            icon={activeRole === option.value ? <Check /> : <span className="size-4" />}
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownContent>
            </Dropdown>
            <Can permission="users.create">
                <Link href={route('users.create')} prefetch className={buttonVariants({ size: 'sm' })}>
                    <Plus />
                    {__('Add user')}
                </Link>
            </Can>
        </>
    );

    return (
        <>
            <Head title={__('Users')} />

            <Panel fill>
                <Panel.Header title="Users" icon={Users} actions={headerActions} />
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
                        rows={users.data}
                        columns={columns}
                        getRowId={(user) => String(user.id)}
                        rowNumberOffset={(users.currentPage - 1) * users.perPage}
                        sort={table.query.sort}
                        onSortChange={table.setSort}
                        isLoading={table.isLoading}
                        pendingRowIds={deletingIds}
                        rowActions={
                            canEdit || canDelete
                                ? (user) => (
                                      <Dropdown>
                                          <DropdownTrigger
                                              aria-label={__('Actions for :name', { name: user.name })}
                                              className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}
                                          >
                                              <MoreHorizontal />
                                          </DropdownTrigger>
                                          <DropdownContent>
                                              {canEdit && (
                                                  <DropdownItem icon={<Pencil />} href={route('users.edit', user.id)}>
                                                      {__('Edit')}
                                                  </DropdownItem>
                                              )}
                                              {canEdit && canDelete && <DropdownSeparator />}
                                              {canDelete && (
                                                  <DropdownItem
                                                      icon={<Trash2 />}
                                                      tone="danger"
                                                      disabled={user.id === auth.user.id}
                                                      onSelect={() => deleteUser(user)}
                                                  >
                                                      {__('Delete')}
                                                  </DropdownItem>
                                              )}
                                          </DropdownContent>
                                      </Dropdown>
                                  )
                                : undefined
                        }
                        emptyState={
                            <>
                                <p className="text-ink text-sm font-medium">{__('No users found')}</p>
                                <p className="text-ink-muted text-sm">{__('Try a different keyword, role or status.')}</p>
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
                            currentPage={users.currentPage}
                            lastPage={users.lastPage}
                            onPageChange={table.setPage}
                            loadingPage={table.loadingPage}
                            from={users.from}
                            to={users.to}
                            total={users.total}
                            perPage={table.query.perPage ?? users.perPage}
                            onPerPageChange={table.setPerPage}
                        />
                    </div>
                </Panel.Body>
            </Panel>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
UsersIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

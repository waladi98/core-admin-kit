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
    Modal,
    ModalFooter,
    Pagination,
    Panel,
    buttonVariants,
    iconButtonVariants,
    type BadgeProps,
    type BreadcrumbEntry,
    type FilterTabOption,
} from '@/components/core';
import { useTableQuery } from '@/hooks/use-table-query';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type TableSort } from '@/types/table';
import { type ManagedUser, type UserIndexProps, type UserRole, type UserStatus } from '@/types/user-management';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Filter, LoaderCircle, MoreHorizontal, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Users', href: '/users', icon: Users }];

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
            <Badge shape="pill" tone={roleTones[user.role]}>
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
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
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

    const confirmDelete = () => {
        if (!userToDelete) {
            return;
        }

        const rowId = String(userToDelete.id);
        setUserToDelete(null);

        router.delete(route('users.destroy', userToDelete.id), {
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
                placeholder="Search name or email…"
                aria-label="Search users"
                leadingIcon={table.isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                value={table.query.search}
                onChange={(event) => table.setSearch(event.target.value)}
                wrapperClassName="h-8 w-48 sm:w-64"
            />
            <Dropdown>
                <DropdownTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), activeRole && 'border-brand')}>
                    <Filter />
                    {activeRole ? roleOptions.find((option) => option.value === activeRole)?.label : 'Filter'}
                </DropdownTrigger>
                <DropdownContent>
                    <DropdownLabel>Role</DropdownLabel>
                    <DropdownItem onSelect={() => table.setFilter('role', null)} icon={activeRole === null ? <Check /> : <span className="size-4" />}>
                        All roles
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
            <Link href={route('users.create')} prefetch className={buttonVariants({ size: 'sm' })}>
                <Plus />
                Add user
            </Link>
        </>
    );

    return (
        <>
            <Head title="Users" />

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
                        rowActions={(user) => (
                            <Dropdown>
                                <DropdownTrigger
                                    aria-label={`Actions for ${user.name}`}
                                    className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}
                                >
                                    <MoreHorizontal />
                                </DropdownTrigger>
                                <DropdownContent>
                                    <DropdownItem icon={<Pencil />} href={route('users.edit', user.id)}>
                                        Edit
                                    </DropdownItem>
                                    <DropdownSeparator />
                                    <DropdownItem
                                        icon={<Trash2 />}
                                        tone="danger"
                                        disabled={user.id === auth.user.id}
                                        onSelect={() => setUserToDelete(user)}
                                    >
                                        Delete
                                    </DropdownItem>
                                </DropdownContent>
                            </Dropdown>
                        )}
                        emptyState={
                            <>
                                <p className="text-ink text-sm font-medium">No users found</p>
                                <p className="text-ink-muted text-sm">Try a different keyword, role or status.</p>
                                {table.hasActiveFilters && (
                                    <Button variant="secondary" size="sm" className="mt-2" onClick={table.reset}>
                                        Reset filters
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

            <Modal
                isOpen={userToDelete !== null}
                onClose={() => setUserToDelete(null)}
                title="Delete this user?"
                description={
                    userToDelete ? `${userToDelete.name} (${userToDelete.email}) will lose access immediately. This cannot be undone.` : undefined
                }
            >
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setUserToDelete(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete user
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
UsersIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

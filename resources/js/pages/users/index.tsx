import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import {
    Avatar,
    Badge,
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownTrigger,
    Grid,
    Input,
    Modal,
    ModalFooter,
    Pagination,
    Panel,
    Select,
    buttonVariants,
    iconButtonVariants,
    type BadgeProps,
    type BreadcrumbEntry,
} from '@/components/core';
import { useTableQuery } from '@/hooks/use-table-query';
import AdminLayout from '@/layouts/admin-layout';
import { type SharedData } from '@/types';
import { type TableSort } from '@/types/table';
import { type ManagedUser, type UserIndexProps, type UserRole, type UserStatus } from '@/types/user-management';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { LoaderCircle, MoreVertical, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

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
        cell: (user) => <Badge tone={roleTones[user.role]}>{user.roleLabel}</Badge>,
    },
    {
        key: 'status',
        header: 'Status',
        skeleton: 'badge',
        cell: (user) => (
            <Badge tone={statusTones[user.status]}>
                <span className="size-1.5 rounded-full bg-current" />
                {user.statusLabel}
            </Badge>
        ),
    },
    { key: 'created_at', header: 'Joined', sortable: true, cell: (user) => user.createdAt },
];

/** Parses the server sort (`name` or `-name`) into the table sort state. */
function parseSort(sort: string): TableSort {
    return sort.startsWith('-') ? { key: sort.slice(1), direction: 'desc' } : { key: sort, direction: 'asc' };
}

export default function UsersIndex({ users, filters, roleOptions }: UserIndexProps) {
    const { auth } = usePage<SharedData>().props;
    const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);

    const table = useTableQuery<{ role: string | null }>({
        url: route('users.index'),
        only: ['users', 'filters'],
        initial: {
            search: filters.search ?? '',
            sort: parseSort(filters.sort),
            page: users.currentPage,
            filters: { role: filters.role },
        },
    });

    const confirmDelete = () => {
        if (!userToDelete) {
            return;
        }

        const rowId = String(userToDelete.id);
        setUserToDelete(null);

        router.delete(route('users.destroy', userToDelete.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['users'],
            onStart: () => setDeletingIds((ids) => [...ids, rowId]),
            onFinish: () => setDeletingIds((ids) => ids.filter((id) => id !== rowId)),
        });
    };

    const toolbar = (
        <>
            <Input
                type="search"
                placeholder="Name or email"
                aria-label="Search users"
                leadingIcon={table.isSearching ? <LoaderCircle className="animate-spin" /> : <Search />}
                value={table.query.search}
                onChange={(event) => table.setSearch(event.target.value)}
                wrapperClassName="h-8 w-44 sm:w-60"
            />
            <Select
                size="sm"
                aria-label="Filter by role"
                placeholder="All roles"
                options={roleOptions}
                value={table.query.filters.role ?? ''}
                onChange={(event) => table.setFilter('role', event.target.value || null)}
                wrapperClassName="w-36"
            />
        </>
    );

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="space-y-6">
                <PageHeader
                    title="Users"
                    description="Manage who can access Finance Core and what they can do."
                    actions={
                        <Link href={route('users.create')} prefetch className={buttonVariants()}>
                            <Plus />
                            Add user
                        </Link>
                    }
                />

                <Grid stagger>
                    <Grid.Item>
                        <Panel>
                            <Panel.Header title={`All users (${users.total})`} icon={Users} actions={toolbar} />
                            <Panel.Body padding="none">
                                <DataTable
                                    rows={users.data}
                                    columns={columns}
                                    getRowId={(user) => String(user.id)}
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
                                                <MoreVertical />
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
                                            <p className="text-ink-muted text-sm">Try a different keyword or role.</p>
                                            {table.hasActiveFilters && (
                                                <Button variant="secondary" size="sm" className="mt-2" onClick={table.reset}>
                                                    Reset filters
                                                </Button>
                                            )}
                                        </>
                                    }
                                />
                                {users.lastPage > 1 && (
                                    <div className="border-line border-t px-3 py-2">
                                        <Pagination
                                            currentPage={users.currentPage}
                                            lastPage={users.lastPage}
                                            onPageChange={table.setPage}
                                            loadingPage={table.loadingPage}
                                            from={users.from}
                                            to={users.to}
                                            total={users.total}
                                        />
                                    </div>
                                )}
                            </Panel.Body>
                        </Panel>
                    </Grid.Item>
                </Grid>
            </div>

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
        </AdminLayout>
    );
}

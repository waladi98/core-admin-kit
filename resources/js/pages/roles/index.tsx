import { Can } from '@/components/admin/can';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import {
    Badge,
    Button,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownSeparator,
    DropdownTrigger,
    Modal,
    ModalFooter,
    Panel,
    buttonVariants,
    iconButtonVariants,
    type BreadcrumbEntry,
} from '@/components/core';
import { usePermissions } from '@/hooks/use-can';
import AdminLayout from '@/layouts/admin-layout';
import { type RoleIndexProps, type RoleRow } from '@/types/roles';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, LockKeyhole, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Roles & Permissions', href: '/roles', icon: LockKeyhole }];

/** Why a role cannot be deleted, or null when it can. */
function deleteBlockedReason(role: RoleRow): string | null {
    if (role.isBuiltIn) {
        return 'Built-in roles cannot be deleted.';
    }

    if (role.usersCount > 0) {
        return 'Move its users to another role first.';
    }

    return null;
}

export default function RolesIndex({ roles, totalPermissions }: RoleIndexProps) {
    const can = usePermissions();
    const canManage = can('roles.manage');
    const [roleToDelete, setRoleToDelete] = useState<RoleRow | null>(null);
    const [deletingIds, setDeletingIds] = useState<string[]>([]);

    const columns: DataTableColumn<RoleRow>[] = [
        {
            key: 'label',
            header: 'Role',
            className: 'w-full min-w-48',
            sortValue: (role) => role.label,
            cell: (role) => (
                <span className="inline-flex items-center gap-2">
                    <span className="text-ink font-medium">{role.label}</span>
                    {role.isAdmin && (
                        <Badge shape="pill" tone="info">
                            Full access
                        </Badge>
                    )}
                    {role.isBuiltIn && !role.isAdmin && (
                        <Badge shape="pill" tone="neutral">
                            Built-in
                        </Badge>
                    )}
                </span>
            ),
        },
        {
            key: 'users',
            header: 'Users',
            sortValue: (role) => role.usersCount,
            cell: (role) => <span className="tabular-nums">{role.usersCount}</span>,
        },
        {
            key: 'permissions',
            header: 'Permissions',
            sortValue: (role) => role.permissionsCount,
            cell: (role) => (
                <span className="inline-flex items-center gap-2">
                    <span className="bg-surface-muted relative h-1.5 w-20 overflow-hidden rounded-full" aria-hidden="true">
                        <span
                            className="bg-brand absolute inset-y-0 left-0 rounded-full"
                            style={{ width: `${totalPermissions ? (role.permissionsCount / totalPermissions) * 100 : 0}%` }}
                        />
                    </span>
                    <span className="tabular-nums">
                        {role.permissionsCount} / {totalPermissions}
                    </span>
                </span>
            ),
        },
    ];

    const confirmDelete = () => {
        if (!roleToDelete) {
            return;
        }

        const rowId = String(roleToDelete.id);
        setRoleToDelete(null);

        router.delete(route('roles.destroy', roleToDelete.id), {
            preserveScroll: true,
            preserveState: true,
            only: ['roles'],
            onStart: () => setDeletingIds((ids) => [...ids, rowId]),
            onFinish: () => setDeletingIds((ids) => ids.filter((id) => id !== rowId)),
        });
    };

    return (
        <>
            <Head title="Roles & Permissions" />

            <Panel fill>
                <Panel.Header
                    title="Roles & Permissions"
                    icon={LockKeyhole}
                    actions={
                        <Can permission="roles.manage">
                            <Link href={route('roles.create')} prefetch className={buttonVariants({ size: 'sm' })}>
                                <Plus />
                                Add role
                            </Link>
                        </Can>
                    }
                />
                <Panel.Body padding="none" className="flex flex-col">
                    <DataTable
                        stickyHeader
                        rows={roles}
                        columns={columns}
                        getRowId={(role) => String(role.id)}
                        rowNumberOffset={0}
                        pendingRowIds={deletingIds}
                        rowActions={(role) => {
                            const isEditable = canManage && !role.isAdmin;
                            const blockedReason = deleteBlockedReason(role);

                            return (
                                <Dropdown>
                                    <DropdownTrigger
                                        aria-label={`Actions for ${role.label}`}
                                        className={iconButtonVariants({ variant: 'ghost', size: 'sm' })}
                                    >
                                        <MoreHorizontal />
                                    </DropdownTrigger>
                                    <DropdownContent>
                                        <DropdownItem icon={isEditable ? <Pencil /> : <Eye />} href={route('roles.edit', role.id)}>
                                            {isEditable ? 'Edit permissions' : 'View permissions'}
                                        </DropdownItem>
                                        {canManage && (
                                            <>
                                                <DropdownSeparator />
                                                <DropdownItem
                                                    icon={<Trash2 />}
                                                    tone="danger"
                                                    disabled={blockedReason !== null}
                                                    onSelect={() => setRoleToDelete(role)}
                                                >
                                                    <span className="flex flex-col">
                                                        Delete
                                                        {blockedReason && <span className="text-ink-muted text-xs">{blockedReason}</span>}
                                                    </span>
                                                </DropdownItem>
                                            </>
                                        )}
                                    </DropdownContent>
                                </Dropdown>
                            );
                        }}
                        emptyMessage="No roles yet."
                    />
                    <p className="border-line text-ink-muted shrink-0 border-t px-3 py-2.5 text-xs">
                        {roles.length} {roles.length === 1 ? 'role' : 'roles'} · Admin always has every permission. Changes apply on the user's next
                        page load.
                    </p>
                </Panel.Body>
            </Panel>

            <Modal
                isOpen={roleToDelete !== null}
                onClose={() => setRoleToDelete(null)}
                title="Delete this role?"
                description={roleToDelete ? `The ${roleToDelete.label} role will be removed. This cannot be undone.` : undefined}
            >
                <ModalFooter>
                    <Button variant="secondary" onClick={() => setRoleToDelete(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete role
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
RolesIndex.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

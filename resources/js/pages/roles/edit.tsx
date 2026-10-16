import { RoleForm } from '@/components/admin/role-form';
import { type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type RoleEditProps } from '@/types/roles';
import { Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { type ReactElement } from 'react';

function editBreadcrumbs(role: RoleEditProps['role']): BreadcrumbEntry[] {
    return [
        { title: 'Roles & Permissions', href: '/roles', icon: LockKeyhole },
        { title: role.label, href: route('roles.edit', role.id) },
    ];
}

export default function EditRole({ role, permissionGroups, canUpdate }: RoleEditProps) {
    const readOnlyReason = role.isAdmin
        ? 'The Admin role always has every permission, including ones added later. It cannot be changed.'
        : 'You can view this role but do not have permission to change it.';

    return (
        <>
            <Head title={`Role ${role.label}`} />
            <RoleForm
                method="put"
                action={route('roles.update', role.id)}
                submitLabel="Save changes"
                permissionGroups={permissionGroups}
                isNameLocked={role.isBuiltIn}
                isReadOnly={!canUpdate}
                readOnlyReason={canUpdate ? undefined : readOnlyReason}
                initialValues={{ name: role.label, permissions: role.permissions }}
            />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
EditRole.layout = (page: ReactElement<RoleEditProps>) => (
    <AdminLayout breadcrumbs={editBreadcrumbs(page.props.role)} title={`Role · ${page.props.role.label}`}>
        {page}
    </AdminLayout>
);

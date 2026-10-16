import { RoleForm } from '@/components/admin/role-form';
import { type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type RoleCreateProps } from '@/types/roles';
import { Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Roles & Permissions', href: '/roles', icon: LockKeyhole },
    { title: 'Add role', href: '/roles/create' },
];

export default function CreateRole({ permissionGroups }: RoleCreateProps) {
    return (
        <>
            <Head title="Add role" />
            <RoleForm
                method="post"
                action={route('roles.store')}
                submitLabel="Save role"
                permissionGroups={permissionGroups}
                initialValues={{ name: '', permissions: [] }}
            />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
CreateRole.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Add role">
        {page}
    </AdminLayout>
);

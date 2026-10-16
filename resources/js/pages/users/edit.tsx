import { UserForm } from '@/components/admin/user-form';
import { type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type UserEditProps } from '@/types/user-management';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { type ReactElement } from 'react';

function editBreadcrumbs(user: UserEditProps['user']): BreadcrumbEntry[] {
    return [
        { title: 'Users', href: '/users', icon: Users },
        { title: user.name, href: route('users.edit', user.id) },
    ];
}

export default function EditUser({ user, roleOptions, statusOptions }: UserEditProps) {
    return (
        <>
            <Head title={`Edit ${user.name}`} />
            <UserForm
                method="put"
                action={route('users.update', user.id)}
                submitLabel="Save changes"
                isPasswordOptional
                roleOptions={roleOptions}
                statusOptions={statusOptions}
                initialValues={{
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    password: '',
                    password_confirmation: '',
                }}
            />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
EditUser.layout = (page: ReactElement<UserEditProps>) => (
    <AdminLayout breadcrumbs={editBreadcrumbs(page.props.user)} title={`Edit user · ${page.props.user.name}`}>
        {page}
    </AdminLayout>
);

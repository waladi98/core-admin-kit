import { UserForm } from '@/components/admin/user-form';
import { type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type UserFormOptions } from '@/types/user-management';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Users', href: '/users', icon: Users },
    { title: 'Add user', href: '/users/create' },
];

export default function CreateUser({ roleOptions, statusOptions }: UserFormOptions) {
    return (
        <>
            <Head title="Add user" />
            <UserForm
                method="post"
                action={route('users.store')}
                submitLabel="Save user"
                roleOptions={roleOptions}
                statusOptions={statusOptions}
                initialValues={{
                    name: '',
                    email: '',
                    role: 'staff',
                    status: 'active',
                    password: '',
                    password_confirmation: '',
                }}
            />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
CreateUser.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Add user">
        {page}
    </AdminLayout>
);

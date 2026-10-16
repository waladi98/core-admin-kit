import { PageHeader } from '@/components/admin/page-header';
import { UserForm } from '@/components/admin/user-form';
import { Grid, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type UserFormOptions } from '@/types/user-management';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Users', href: '/users', icon: Users },
    { title: 'Add user', href: '/users/create' },
];

export default function CreateUser({ roleOptions, statusOptions }: UserFormOptions) {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Add user" />
            <div className="space-y-6">
                <PageHeader title="Add user" description="Create a new account and assign its role." />

                <Grid stagger>
                    <Grid.Item span={{ base: 12, xl: 8 }}>
                        <UserForm
                            method="post"
                            action={route('users.store')}
                            submitLabel="Create user"
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
                    </Grid.Item>
                </Grid>
            </div>
        </AdminLayout>
    );
}

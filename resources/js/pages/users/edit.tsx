import { PageHeader } from '@/components/admin/page-header';
import { UserForm } from '@/components/admin/user-form';
import { Grid, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { type UserEditProps } from '@/types/user-management';
import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';

export default function EditUser({ user, roleOptions, statusOptions }: UserEditProps) {
    const breadcrumbs: BreadcrumbEntry[] = [
        { title: 'Users', href: '/users', icon: Users },
        { title: user.name, href: route('users.edit', user.id) },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />
            <div className="space-y-6">
                <PageHeader title="Edit user" description={user.email} />

                <Grid stagger>
                    <Grid.Item span={{ base: 12, xl: 8 }}>
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
                    </Grid.Item>
                </Grid>
            </div>
        </AdminLayout>
    );
}

import { type BreadcrumbEntry } from '@/components/core';
import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, type ReactNode } from 'react';

import { Button, Input, Label } from '@/components/core';
import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbEntry[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <>
            <Head title="Profile settings" />
            <div className="space-y-6">
                <HeadingSmall title="Profile information" description="Update your name and email address" />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>

                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />

                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>

                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />

                        <InputError className="mt-2" message={errors.email} />
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div>
                            <p className="text-ink-muted mt-2 text-sm">
                                Your email address is unverified.
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="text-ink-muted hover:text-ink rounded-md text-sm underline focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                >
                                    Click here to re-send the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="text-success mt-2 text-sm font-medium">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Save
                        </Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-ink-muted text-sm">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>

            <DeleteUser />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Profile.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs}>
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

import { Button, FormActions, FormField, FormSection, Input, Select, type BreadcrumbEntry } from '@/components/core';
import DeleteUser from '@/components/delete-user';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { __ } from '@/lib/i18n';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Check, UserRound } from 'lucide-react';
import { type FormEventHandler, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Profile', href: '/settings/profile' },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth, locale, locales } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        locale: (auth.user.locale as string | null) ?? locale,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <>
            <Head title={__('Profile settings')} />

            <form onSubmit={submit}>
                <FormSection icon={UserRound} title="Profile information" description="Update your name, email address and language.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Name" htmlFor="name" required error={errors.name}>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={__('Full name')}
                                invalid={Boolean(errors.name)}
                            />
                        </FormField>

                        <FormField label="Email address" htmlFor="email" required hint="Used to sign in." error={errors.email}>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder={__('Email address')}
                                invalid={Boolean(errors.email)}
                            />
                        </FormField>

                        <FormField label="Language" htmlFor="locale" hint="Used for menus, labels and messages." error={errors.locale}>
                            <Select
                                id="locale"
                                options={Object.entries(locales).map(([value, label]) => ({ value, label }))}
                                value={data.locale}
                                onChange={(e) => setData('locale', e.target.value)}
                                invalid={Boolean(errors.locale)}
                            />
                        </FormField>
                    </div>

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div className="mt-4 text-sm">
                            <p className="text-ink-muted">
                                {__('Your email address is unverified.')}{' '}
                                <Link href={route('verification.send')} method="post" as="button" className="text-ink underline underline-offset-4">
                                    {__('Click here to re-send the verification email.')}
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <p className="text-success mt-2 font-medium">{__('A new verification link has been sent to your email address.')}</p>
                            )}
                        </div>
                    )}

                    <FormActions className="border-line mt-4 border-t pt-4">
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Check />}
                            {__('Save')}
                        </Button>
                    </FormActions>
                </FormSection>
            </form>

            <DeleteUser />
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Profile.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Profile settings">
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

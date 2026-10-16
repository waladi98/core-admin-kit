import { Button, FileUpload, FormActions, FormField, FormSection, Input, Select, type BreadcrumbEntry } from '@/components/core';
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

    const { data, setData, post, errors, processing } = useForm<{
        _method: 'patch';
        name: string;
        email: string;
        locale: string;
        avatar: File | null;
        remove_avatar: boolean;
    }>({
        _method: 'patch',
        name: auth.user.name,
        email: auth.user.email,
        locale: (auth.user.locale as string | null) ?? locale,
        avatar: null,
        remove_avatar: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Files need multipart form data, which PHP only parses on POST; `_method` makes Laravel treat it as PATCH.
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setData((current) => ({ ...current, avatar: null, remove_avatar: false })),
        });
    };

    return (
        <>
            <Head title={__('Profile settings')} />

            <form onSubmit={submit}>
                <FormSection icon={UserRound} title="Profile information" description="Update your photo, name, email address and language.">
                    <FormField
                        label="Profile photo"
                        htmlFor="avatar"
                        hint="JPG, PNG or WebP, up to 2 MB."
                        error={errors.avatar}
                        className="mb-4 max-w-xl"
                    >
                        <FileUpload
                            id="avatar"
                            variant="avatar"
                            accept="image/jpeg,image/png,image/webp"
                            maxSizeMb={2}
                            name={data.name}
                            currentUrl={data.remove_avatar ? null : (auth.user.avatar ?? null)}
                            value={data.avatar}
                            onChange={(file) => setData((current) => ({ ...current, avatar: file, remove_avatar: false }))}
                            invalid={Boolean(errors.avatar)}
                        />
                        {auth.user.avatar && !data.avatar && !data.remove_avatar && (
                            <button
                                type="button"
                                onClick={() => setData('remove_avatar', true)}
                                className="text-danger justify-self-start text-xs font-medium underline underline-offset-4"
                            >
                                {__('Remove photo')}
                            </button>
                        )}
                    </FormField>

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

import { Button, FormActions, FormField, FormSection, Input, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { __ } from '@/lib/i18n';
import { Head, useForm } from '@inertiajs/react';
import { Check, KeyRound } from 'lucide-react';
import { useRef, type FormEventHandler, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Password', href: '/settings/password' },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <>
            <Head title={__('Password settings')} />

            <form onSubmit={updatePassword}>
                <FormSection icon={KeyRound} title="Update password" description="Use a long, random password to keep your account secure.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Current password" htmlFor="current_password" required error={errors.current_password}>
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                autoComplete="current-password"
                                placeholder={__('Current password')}
                                invalid={Boolean(errors.current_password)}
                            />
                        </FormField>

                        <FormField label="New password" htmlFor="password" required error={errors.password}>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder={__('New password')}
                                invalid={Boolean(errors.password)}
                            />
                        </FormField>

                        <FormField label="Confirm password" htmlFor="password_confirmation" required error={errors.password_confirmation}>
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder={__('Confirm password')}
                                invalid={Boolean(errors.password_confirmation)}
                            />
                        </FormField>
                    </div>

                    <FormActions className="border-line mt-4 border-t pt-4">
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Check />}
                            {__('Save password')}
                        </Button>
                    </FormActions>
                </FormSection>
            </form>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Password.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Password settings">
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

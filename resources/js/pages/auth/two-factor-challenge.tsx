import { Button, Input, Label } from '@/components/core';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { useTranslation } from '@/hooks/use-translation';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { type FormEventHandler, useState } from 'react';

/**
 * Second step of signing in for accounts with two-factor authentication.
 * Posts to Fortify's challenge endpoint (code from the authenticator app, or a recovery code).
 */
export default function TwoFactorChallenge() {
    const { t } = useTranslation();
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({ code: '', recovery_code: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('two-factor.login.store'), { onFinish: () => reset() });
    };

    const toggleMode = () => {
        setUseRecoveryCode((current) => !current);
        clearErrors();
        reset();
    };

    return (
        <AuthLayout
            title="Two-factor authentication"
            description={useRecoveryCode ? 'Enter one of your emergency recovery codes.' : 'Enter the 6-digit code from your authenticator app.'}
        >
            <Head title={t('Two-factor authentication')} />

            <form onSubmit={submit} className="flex flex-col gap-6">
                {useRecoveryCode ? (
                    <div className="grid gap-2">
                        <Label htmlFor="recovery_code">{t('Recovery code')}</Label>
                        <Input
                            id="recovery_code"
                            value={data.recovery_code}
                            onChange={(event) => setData('recovery_code', event.target.value)}
                            autoComplete="one-time-code"
                            autoFocus
                            required
                            invalid={Boolean(errors.recovery_code)}
                        />
                        <InputError message={errors.recovery_code} />
                    </div>
                ) : (
                    <div className="grid gap-2">
                        <Label htmlFor="code">{t('Authentication code')}</Label>
                        <Input
                            id="code"
                            value={data.code}
                            onChange={(event) => setData('code', event.target.value.replace(/\D/g, '').slice(0, 6))}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            autoFocus
                            required
                            placeholder="123456"
                            className="text-center font-mono text-lg tracking-[0.4em]"
                            invalid={Boolean(errors.code)}
                        />
                        <InputError message={errors.code} />
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={processing}>
                    {t('Continue')}
                </Button>

                <div className="text-ink-muted space-y-2 text-center text-sm">
                    <button type="button" onClick={toggleMode} className="text-ink underline underline-offset-4">
                        {useRecoveryCode ? t('Use the authenticator app instead') : t('Use a recovery code instead')}
                    </button>
                    <p>
                        <TextLink href={route('login')}>{t('Back to log in')}</TextLink>
                    </p>
                </div>
            </form>
        </AuthLayout>
    );
}

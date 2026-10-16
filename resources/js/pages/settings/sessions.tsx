import { Badge, Button, FormField, FormSection, Input, useConfirm, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { formatDateTime, formatRelative } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { Head, useForm } from '@inertiajs/react';
import { LogOut, Monitor, MonitorSmartphone, Smartphone } from 'lucide-react';
import { type FormEventHandler, type ReactNode } from 'react';

interface SessionEntry {
    id: string;
    browser: string;
    platform: string;
    isMobile: boolean;
    ipAddress: string | null;
    isCurrent: boolean;
    lastActiveAt: string;
}

interface SessionsProps {
    sessions: SessionEntry[];
    isSupported: boolean;
}

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Sessions', href: '/settings/sessions' },
];

export default function Sessions({ sessions, isSupported }: SessionsProps) {
    const confirm = useConfirm();
    const { data, setData, delete: destroy, errors, processing, reset } = useForm({ password: '' });
    const otherSessions = sessions.filter((session) => !session.isCurrent).length;

    const signOutOthers: FormEventHandler = async (event) => {
        event.preventDefault();

        const confirmed = await confirm({
            title: 'Sign out of other devices?',
            description: __('Every other browser and device signed in to your account will be signed out.'),
            confirmLabel: 'Sign out other devices',
            tone: 'danger',
        });

        if (confirmed) {
            destroy(route('sessions.destroy-others'), { preserveScroll: true, onFinish: () => reset('password') });
        }
    };

    return (
        <>
            <Head title={__('Sessions')} />

            <FormSection
                icon={MonitorSmartphone}
                title="Where you are signed in"
                description="Devices and browsers that have used your account recently. Sign out of any you do not recognise."
            >
                {!isSupported ? (
                    <p className="text-ink-muted text-sm">{__('Session list needs the database session driver (SESSION_DRIVER=database).')}</p>
                ) : (
                    <ul className="divide-line divide-y">
                        {sessions.map((session) => {
                            const Icon = session.isMobile ? Smartphone : Monitor;

                            return (
                                <li key={session.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                    <span className="rounded-field border-line text-ink-soft flex size-9 shrink-0 items-center justify-center border">
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-ink text-sm font-medium">
                                            {__(':browser on :platform', { browser: __(session.browser), platform: __(session.platform) })}
                                        </p>
                                        <p className="text-ink-muted text-xs">
                                            {session.ipAddress ?? '—'} ·{' '}
                                            <span title={formatDateTime(session.lastActiveAt)}>{formatRelative(session.lastActiveAt)}</span>
                                        </p>
                                    </div>
                                    {session.isCurrent && (
                                        <Badge shape="pill" tone="success">
                                            {__('This device')}
                                        </Badge>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </FormSection>

            {isSupported && (
                <form onSubmit={signOutOthers}>
                    <FormSection
                        icon={LogOut}
                        title="Sign out other devices"
                        description="Confirm with your password. You stay signed in on this device."
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <FormField label="Password" htmlFor="password" required error={errors.password} className="sm:w-72">
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(event) => setData('password', event.target.value)}
                                    autoComplete="current-password"
                                    invalid={Boolean(errors.password)}
                                    required
                                />
                            </FormField>
                            <Button type="submit" variant="danger" isLoading={processing} disabled={otherSessions === 0} className="sm:mb-px">
                                {!processing && <LogOut />}
                                {__('Sign out other devices')}
                            </Button>
                        </div>
                        {otherSessions === 0 && <p className="text-ink-muted mt-2 text-xs">{__('You are not signed in anywhere else.')}</p>}
                    </FormSection>
                </form>
            )}
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Sessions.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Sessions">
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

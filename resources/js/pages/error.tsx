import { BrandLogo } from '@/components/admin/brand-logo';
import { buttonVariants } from '@/components/core';
import { useBrandColor } from '@/hooks/use-brand-color';
import { useSyncTranslations, useTranslation } from '@/hooks/use-translation';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Ban, FileQuestion, LayoutGrid, ServerCrash, Wrench, type LucideIcon } from 'lucide-react';

interface ErrorPageProps {
    status: 403 | 404 | 500 | 503;
    isSignedIn: boolean;
}

const content: Record<ErrorPageProps['status'], { icon: LucideIcon; title: string; description: string }> = {
    403: {
        icon: Ban,
        title: 'Access denied',
        description: 'You do not have permission to open this page. Ask an administrator if you need access.',
    },
    404: {
        icon: FileQuestion,
        title: 'Page not found',
        description: 'The page you are looking for does not exist or has been moved.',
    },
    500: {
        icon: ServerCrash,
        title: 'Something went wrong',
        description: 'An unexpected error occurred on our side. Please try again in a moment.',
    },
    503: {
        icon: Wrench,
        title: 'Under maintenance',
        description: 'We are doing some maintenance right now. Please come back in a few minutes.',
    },
};

/**
 * Rendered by the exception handler in bootstrap/app.php. It does not rely on
 * shared props (a 404 can happen before the web middleware runs), so the
 * handler passes the locale and translations itself.
 */
export default function ErrorPage({ status, isSignedIn }: ErrorPageProps) {
    useSyncTranslations();
    useBrandColor();
    const { t } = useTranslation();
    const page = content[status] ?? content[500];
    const Icon = page.icon;

    return (
        <>
            <Head title={`${status} · ${t(page.title)}`} />

            <main className="bg-surface-muted flex min-h-svh flex-col items-center justify-center p-6">
                <div className="mb-6">
                    <BrandLogo size="lg" />
                </div>

                <div className="rounded-panel border-line bg-surface-muted w-full max-w-md border p-1">
                    <div className="rounded-panel border-line bg-surface shadow-panel border p-8 text-center">
                        <span className="rounded-field border-line text-ink-soft mx-auto mb-4 flex size-12 items-center justify-center border">
                            <Icon className="size-6" aria-hidden="true" />
                        </span>
                        <p className="text-ink-muted text-sm font-medium tabular-nums">{t('Error :code', { code: status })}</p>
                        <h1 className="text-ink mt-1 text-xl font-semibold tracking-tight">{t(page.title)}</h1>
                        <p className="text-ink-muted mt-2 text-sm">{t(page.description)}</p>

                        <div className="mt-6 flex flex-col-reverse justify-center gap-2 sm:flex-row">
                            <button type="button" onClick={() => window.history.back()} className={buttonVariants({ variant: 'secondary' })}>
                                <ArrowLeft />
                                {t('Go back')}
                            </button>
                            {status !== 503 && (
                                <Link href={isSignedIn ? route('dashboard') : route('home')} className={buttonVariants()}>
                                    <LayoutGrid />
                                    {isSignedIn ? t('Go to dashboard') : t('Go to home page')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

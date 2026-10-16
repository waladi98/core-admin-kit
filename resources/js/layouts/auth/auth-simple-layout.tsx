import { BrandLogo } from '@/components/admin/brand-logo';
import { useSyncTranslations, useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { Link, router } from '@inertiajs/react';
import { Languages } from 'lucide-react';
import { type ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    useSyncTranslations();
    const { t, locale, locales } = useTranslation();

    return (
        <div className="bg-surface-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex justify-center">
                    <Link href={route('home')} aria-label={t('Finance Core home')}>
                        <BrandLogo size="lg" />
                    </Link>
                </div>

                <div className="rounded-panel border-line bg-surface-muted border p-1">
                    <div className="rounded-panel border-line bg-surface shadow-panel border p-6 sm:p-8">
                        <div className="mb-6 space-y-1.5 text-center">
                            {title && <h1 className="text-ink text-xl font-semibold tracking-tight">{t(title)}</h1>}
                            {description && <p className="text-ink-muted text-sm">{t(description)}</p>}
                        </div>
                        {children}
                    </div>
                </div>

                <nav aria-label={t('Language')} className="text-ink-muted mt-4 flex items-center justify-center gap-1 text-xs">
                    <Languages className="size-3.5" aria-hidden="true" />
                    {Object.entries(locales).map(([code, name]) => (
                        <button
                            key={code}
                            type="button"
                            aria-pressed={code === locale}
                            onClick={() => code !== locale && router.post(route('locale.update'), { locale: code }, { preserveScroll: true })}
                            className={cn(
                                'rounded-field px-2 py-1 transition-colors',
                                code === locale ? 'text-ink bg-surface ring-line font-medium ring-1' : 'hover:text-ink',
                            )}
                        >
                            {name}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
}

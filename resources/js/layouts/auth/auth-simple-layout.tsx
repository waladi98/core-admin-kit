import { BrandLogo } from '@/components/admin/brand-logo';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="bg-surface-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="mb-6 flex justify-center">
                    <Link href={route('home')} aria-label="Finance Core home">
                        <BrandLogo size="lg" />
                    </Link>
                </div>

                <div className="rounded-panel border-line bg-surface-muted border p-1">
                    <div className="rounded-panel border-line bg-surface shadow-panel border p-6 sm:p-8">
                        <div className="mb-6 space-y-1.5 text-center">
                            <h1 className="text-ink text-xl font-semibold tracking-tight">{title}</h1>
                            <p className="text-ink-muted text-sm">{description}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

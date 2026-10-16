import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Wallet } from 'lucide-react';

export interface BrandLogoProps {
    showName?: boolean;
    size?: 'md' | 'lg';
    className?: string;
}

const DEFAULT_NAME = 'Finance Core';

/**
 * Logo + application name from Settings → Application (falls back to the default icon and name).
 */
export function BrandLogo({ showName = true, size = 'md', className }: BrandLogoProps) {
    const { branding } = usePage<SharedData>().props;
    const name = branding?.name || DEFAULT_NAME;

    return (
        <span className={cn('flex min-w-0 items-center gap-2', className)}>
            {branding?.logoUrl ? (
                <img src={branding.logoUrl} alt="" className={cn('shrink-0 rounded-md object-contain', size === 'lg' ? 'size-10' : 'size-7')} />
            ) : (
                <span
                    className={cn(
                        'bg-brand text-brand-foreground flex shrink-0 items-center justify-center rounded-md',
                        size === 'lg' ? 'size-10 [&_svg]:size-5' : 'size-7 [&_svg]:size-4',
                    )}
                >
                    <Wallet />
                </span>
            )}
            {showName && <span className={cn('text-ink truncate font-semibold', size === 'lg' ? 'text-lg' : 'text-base')}>{name}</span>}
        </span>
    );
}

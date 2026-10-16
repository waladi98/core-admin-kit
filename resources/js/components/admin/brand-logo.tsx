import { cn } from '@/lib/utils';
import { Wallet } from 'lucide-react';

export interface BrandLogoProps {
    showName?: boolean;
    size?: 'md' | 'lg';
    className?: string;
}

export function BrandLogo({ showName = true, size = 'md', className }: BrandLogoProps) {
    return (
        <span className={cn('flex min-w-0 items-center gap-2', className)}>
            <span
                className={cn(
                    'bg-brand text-brand-foreground flex shrink-0 items-center justify-center rounded-md',
                    size === 'lg' ? 'size-10 [&_svg]:size-5' : 'size-7 [&_svg]:size-4',
                )}
            >
                <Wallet />
            </span>
            {showName && <span className={cn('text-ink truncate font-semibold', size === 'lg' ? 'text-lg' : 'text-base')}>Finance Core</span>}
        </span>
    );
}

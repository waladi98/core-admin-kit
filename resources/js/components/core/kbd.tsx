import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
    return (
        <kbd
            className={cn(
                'border-line bg-surface-muted text-ink-muted inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded border px-1 font-sans text-[11px] font-medium',
                className,
            )}
            {...props}
        />
    );
}

import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

export const badgeVariants = cva('inline-flex items-center gap-1 whitespace-nowrap font-medium [&_svg]:size-3.5 [&_svg]:shrink-0', {
    variants: {
        tone: {
            neutral: 'bg-surface-muted text-ink-soft',
            success: 'bg-success-soft text-success',
            danger: 'bg-danger-soft text-danger',
            warning: 'bg-warning-soft text-warning',
            info: 'bg-info-soft text-info',
            brand: 'bg-brand text-brand-foreground',
        },
        size: {
            sm: 'rounded-md px-1.5 py-0.5 text-[11px]',
            md: 'rounded-md px-2 py-0.5 text-xs',
        },
        appearance: {
            soft: '',
            plain: 'bg-transparent px-0',
        },
        shape: {
            rounded: '',
            pill: 'rounded-full px-2.5',
        },
    },
    defaultVariants: {
        tone: 'neutral',
        size: 'md',
        appearance: 'soft',
        shape: 'rounded',
    },
});

export interface BadgeProps extends ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, appearance, shape, ...props }: BadgeProps) {
    return <span className={cn(badgeVariants({ tone, size, appearance, shape }), className)} {...props} />;
}

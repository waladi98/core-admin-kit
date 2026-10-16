import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

export const skeletonVariants = cva(
    'animate-shimmer block bg-[linear-gradient(90deg,var(--color-surface-hover)_25%,var(--color-surface-muted)_50%,var(--color-surface-hover)_75%)] bg-[length:200%_100%]',
    {
        variants: {
            shape: {
                rect: 'rounded-md',
                circle: 'rounded-full',
                text: 'h-3 rounded',
            },
        },
        defaultVariants: {
            shape: 'rect',
        },
    },
);

export interface SkeletonProps extends ComponentProps<'span'>, VariantProps<typeof skeletonVariants> {}

/**
 * Placeholder shape shown while content loads. Size it with className, e.g. "h-8 w-32".
 */
export function Skeleton({ className, shape, ...props }: SkeletonProps) {
    return <span aria-hidden="true" className={cn(skeletonVariants({ shape }), className)} {...props} />;
}

export interface SkeletonTextProps {
    lines?: number;
    className?: string;
}

/**
 * Paragraph placeholder; the last line is shorter so it reads like text.
 */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
    return (
        <span className={cn('flex flex-col gap-2', className)} aria-hidden="true">
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton key={index} shape="text" className={index === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'} />
            ))}
        </span>
    );
}

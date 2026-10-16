import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { type ComponentProps } from 'react';

export const iconButtonVariants = cva(
    'inline-flex shrink-0 items-center justify-center rounded-field transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                ghost: 'text-ink-muted hover:bg-surface-hover hover:text-ink',
                secondary: 'border border-line bg-surface text-ink-soft shadow-panel hover:bg-surface-hover',
                primary: 'bg-brand text-brand-foreground hover:bg-brand-hover',
            },
            size: {
                sm: 'size-7 [&_svg]:size-3.5',
                md: 'size-control-sm [&_svg]:size-4',
                lg: 'size-control [&_svg]:size-4',
            },
        },
        defaultVariants: {
            variant: 'ghost',
            size: 'md',
        },
    },
);

export interface IconButtonProps extends ComponentProps<'button'>, VariantProps<typeof iconButtonVariants> {
    /** Accessible label, required because the button only renders an icon. */
    label: string;
}

export function IconButton({ className, variant, size, label, type = 'button', ...props }: IconButtonProps) {
    return <button type={type} aria-label={label} title={label} className={cn(iconButtonVariants({ variant, size }), className)} {...props} />;
}

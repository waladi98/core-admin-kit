import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { type ComponentProps } from 'react';

export const buttonVariants = cva(
    'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-field font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                primary: 'bg-brand text-brand-foreground hover:bg-brand-hover',
                secondary: 'border border-line bg-surface text-ink-soft shadow-panel hover:bg-surface-hover',
                ghost: 'text-ink-soft hover:bg-surface-hover',
                danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
                link: 'text-ink underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-control-sm px-3 text-xs',
                md: 'h-control px-3.5 text-sm',
                lg: 'h-10 px-4 text-sm',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

export interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

export function Button({ className, variant, size, isLoading = false, disabled, children, type = 'button', ...props }: ButtonProps) {
    return (
        <button type={type} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || isLoading} {...props}>
            {isLoading && <LoaderCircle className="animate-spin" />}
            {children}
        </button>
    );
}

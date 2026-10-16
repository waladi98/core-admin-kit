import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export interface LabelProps extends ComponentProps<'label'> {
    /** Shows a red asterisk after the text. */
    required?: boolean;
}

export function Label({ className, required = false, children, ...props }: LabelProps) {
    return (
        <label className={cn('text-ink-soft text-sm leading-none font-medium select-none', className)} {...props}>
            {children}
            {required && (
                <span className="text-danger ml-0.5" aria-hidden="true">
                    *
                </span>
            )}
        </label>
    );
}

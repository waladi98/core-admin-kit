import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export interface TextareaProps extends ComponentProps<'textarea'> {
    invalid?: boolean;
}

/**
 * Multi-line text field styled like `Input`. Resizable vertically only.
 */
export function Textarea({ className, invalid = false, rows = 3, ...props }: TextareaProps) {
    return (
        <textarea
            rows={rows}
            aria-invalid={invalid || undefined}
            className={cn(
                'rounded-field border-line bg-surface text-ink placeholder:text-ink-subtle focus:border-line-strong focus:ring-brand/10 scrollbar-thin block w-full resize-y border px-3 py-2 text-sm transition-colors outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
                invalid && 'border-danger focus:border-danger focus:ring-danger/15',
                className,
            )}
            {...props}
        />
    );
}

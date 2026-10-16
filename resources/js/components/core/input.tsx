import { cn } from '@/lib/utils';
import { type ComponentProps, type ReactNode } from 'react';

export interface InputProps extends ComponentProps<'input'> {
    leadingIcon?: ReactNode;
    trailing?: ReactNode;
    invalid?: boolean;
    wrapperClassName?: string;
}

export function Input({ className, wrapperClassName, leadingIcon, trailing, invalid = false, type = 'text', ...props }: InputProps) {
    return (
        <div
            className={cn(
                'rounded-field border-line bg-surface focus-within:border-line-strong focus-within:ring-brand/10 flex h-9 w-full items-center gap-2 border px-3 text-sm transition-colors focus-within:ring-2',
                invalid && 'border-danger focus-within:border-danger focus-within:ring-danger/15',
                props.disabled && 'cursor-not-allowed opacity-60',
                wrapperClassName,
            )}
        >
            {leadingIcon && <span className="text-ink-subtle flex shrink-0 [&_svg]:size-4">{leadingIcon}</span>}
            <input
                type={type}
                aria-invalid={invalid || undefined}
                className={cn(
                    'text-ink placeholder:text-ink-subtle h-full w-full min-w-0 bg-transparent outline-none disabled:cursor-not-allowed',
                    className,
                )}
                {...props}
            />
            {trailing && <span className="text-ink-subtle flex shrink-0 items-center">{trailing}</span>}
        </div>
    );
}

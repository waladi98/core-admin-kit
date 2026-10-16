import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { type ComponentProps } from 'react';

const selectVariants = cva(
    'rounded-field border-line bg-surface text-ink focus:border-line-strong focus:ring-brand/10 w-full appearance-none border pr-9 pl-3 outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
    {
        variants: {
            size: {
                sm: 'h-8 text-xs',
                md: 'h-9 text-sm',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends Omit<ComponentProps<'select'>, 'size'>, VariantProps<typeof selectVariants> {
    options: SelectOption[];
    /** Adds an empty first option, e.g. "All roles". */
    placeholder?: string;
    invalid?: boolean;
    wrapperClassName?: string;
}

/**
 * Native select styled like `Input`, so it stays accessible and works on mobile.
 */
export function Select({ options, placeholder, invalid = false, size, className, wrapperClassName, ...props }: SelectProps) {
    return (
        <div className={cn('relative w-full', wrapperClassName)}>
            <select
                aria-invalid={invalid || undefined}
                className={cn(selectVariants({ size }), invalid && 'border-danger focus:border-danger focus:ring-danger/15', className)}
                {...props}
            >
                {placeholder !== undefined && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="text-ink-subtle pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
        </div>
    );
}

import { intlLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export interface CurrencyInputProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange' | 'prefix'> {
    /** Amount in whole units (e.g. rupiah). `null` when empty. */
    value: number | null;
    onChange: (value: number | null) => void;
    /** Currency symbol shown before the number. */
    symbol?: string;
    invalid?: boolean;
    wrapperClassName?: string;
}

/**
 * Money field that shows thousand separators while typing ("Rp 1.250.000")
 * but gives back a plain number (1250000) for the form.
 */
export function CurrencyInput({
    value,
    onChange,
    symbol = 'Rp',
    invalid = false,
    className,
    wrapperClassName,
    disabled,
    ...props
}: CurrencyInputProps) {
    const formatted = value === null ? '' : new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 0 }).format(value);

    return (
        <div
            className={cn(
                'rounded-field border-line bg-surface focus-within:border-line-strong focus-within:ring-brand/10 h-control flex w-full items-center gap-2 border px-3 text-sm transition-colors focus-within:ring-2',
                invalid && 'border-danger focus-within:border-danger focus-within:ring-danger/15',
                disabled && 'cursor-not-allowed opacity-60',
                wrapperClassName,
            )}
        >
            <span className="text-ink-muted shrink-0 font-medium" aria-hidden="true">
                {symbol}
            </span>
            <input
                type="text"
                inputMode="numeric"
                value={formatted}
                onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '');
                    onChange(digits === '' ? null : Number(digits));
                }}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                className={cn(
                    'text-ink placeholder:text-ink-subtle h-full w-full min-w-0 bg-transparent text-right tabular-nums outline-none',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

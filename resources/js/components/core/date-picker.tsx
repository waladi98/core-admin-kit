import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { type ComponentProps } from 'react';

export interface DatePickerProps extends Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> {
    /** ISO date `YYYY-MM-DD`, or an empty string when nothing is chosen. */
    value: string;
    onChange: (value: string) => void;
    /** `date` (default), `datetime-local` or `month`. */
    mode?: 'date' | 'datetime-local' | 'month';
    invalid?: boolean;
    wrapperClassName?: string;
}

/**
 * Date field built on the browser's native picker: the calendar follows the
 * user's language, works with the keyboard and is comfortable on phones.
 * The value is always ISO (`YYYY-MM-DD`), ready to send to Laravel.
 */
export function DatePicker({ value, onChange, mode = 'date', invalid = false, className, wrapperClassName, disabled, ...props }: DatePickerProps) {
    return (
        <div
            className={cn(
                'rounded-field border-line bg-surface focus-within:border-line-strong focus-within:ring-brand/10 h-control relative flex w-full items-center border text-sm transition-colors focus-within:ring-2',
                invalid && 'border-danger focus-within:border-danger focus-within:ring-danger/15',
                disabled && 'cursor-not-allowed opacity-60',
                wrapperClassName,
            )}
        >
            <input
                type={mode}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                className={cn(
                    // The native indicator stretches over the field so a click anywhere opens the calendar.
                    'text-ink h-full w-full min-w-0 bg-transparent pr-9 pl-3 outline-none [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
                    !value && 'text-ink-subtle',
                    className,
                )}
                {...props}
            />
            <CalendarDays className="text-ink-subtle pointer-events-none absolute right-3 size-4" aria-hidden="true" />
        </div>
    );
}

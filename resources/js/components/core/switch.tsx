import { cn } from '@/lib/utils';
import { type ComponentProps, type ReactNode } from 'react';

export interface SwitchProps extends Omit<ComponentProps<'button'>, 'onChange' | 'children'> {
    checked: boolean;
    onChange: (checked: boolean) => void;
    /** Text next to the switch; clicking it toggles too. */
    label?: ReactNode;
    description?: ReactNode;
    size?: 'sm' | 'md';
}

const trackSizes = { sm: 'h-4 w-7', md: 'h-5 w-9' } as const;
const thumbSizes = { sm: 'size-3 data-[checked=true]:translate-x-3', md: 'size-4 data-[checked=true]:translate-x-4' } as const;

/**
 * On/off toggle for settings that take effect as a yes/no choice.
 */
export function Switch({ checked, onChange, label, description, size = 'md', disabled, className, id, ...props }: SwitchProps) {
    const control = (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            data-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'focus-visible:ring-brand/20 relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-brand' : 'bg-line-strong',
                trackSizes[size],
                !label && className,
            )}
            {...props}
        >
            <span
                aria-hidden="true"
                data-checked={checked}
                className={cn('bg-surface shadow-panel block rounded-full transition-transform duration-200', thumbSizes[size])}
            />
        </button>
    );

    if (!label) {
        return control;
    }

    return (
        <div className={cn('flex items-start gap-3', className)}>
            {control}
            <label htmlFor={id} className={cn('min-w-0 cursor-pointer select-none', disabled && 'cursor-not-allowed opacity-60')}>
                <span className="text-ink-soft block text-sm font-medium">{label}</span>
                {description && <span className="text-ink-muted mt-0.5 block text-xs">{description}</span>}
            </label>
        </div>
    );
}

import { cn } from '@/lib/utils';
import { type KeyboardEvent, useRef } from 'react';

export interface FilterTabOption<T extends string> {
    value: T;
    label: string;
    /** Number shown in a small badge next to the label. */
    count?: number;
}

export interface FilterTabsProps<T extends string> {
    options: FilterTabOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    className?: string;
}

/**
 * Pill tabs with counts for quick filters above a table, e.g. "All 12 · Active 10 · Inactive 2".
 */
export function FilterTabs<T extends string>({ options, value, onChange, label, className }: FilterTabsProps<T>) {
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
        const offset = offsets[event.key];

        if (offset === undefined) {
            return;
        }

        event.preventDefault();
        const nextIndex = (index + offset + options.length) % options.length;
        onChange(options[nextIndex].value);
        buttonRefs.current[nextIndex]?.focus();
    };

    return (
        <div role="tablist" aria-label={label} className={cn('flex flex-wrap items-center gap-1.5', className)}>
            {options.map((option, index) => {
                const isSelected = option.value === value;

                return (
                    <button
                        key={option.value}
                        ref={(element) => {
                            buttonRefs.current[index] = element;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        tabIndex={isSelected ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className={cn(
                            'rounded-field focus-visible:ring-brand/20 inline-flex h-7 items-center gap-1.5 border px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2',
                            isSelected
                                ? 'border-brand bg-brand text-brand-foreground'
                                : 'border-line bg-surface text-ink-soft hover:bg-surface-hover',
                        )}
                    >
                        {option.label}
                        {option.count !== undefined && (
                            <span
                                className={cn(
                                    'min-w-5 rounded-full px-1.5 text-center text-xs leading-4',
                                    isSelected ? 'text-brand bg-surface' : 'bg-surface-muted text-ink-muted',
                                )}
                            >
                                {option.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

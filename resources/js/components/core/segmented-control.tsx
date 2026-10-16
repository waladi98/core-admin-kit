import { cn } from '@/lib/utils';
import { type KeyboardEvent, useRef } from 'react';

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

export interface SegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    label?: string;
    size?: 'sm' | 'md';
    className?: string;
}

export function SegmentedControl<T extends string>({ options, value, onChange, label, size = 'sm', className }: SegmentedControlProps<T>) {
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
        <div role="radiogroup" aria-label={label} className={cn('grid auto-cols-fr grid-flow-col gap-1.5', className)}>
            {options.map((option, index) => {
                const isSelected = option.value === value;

                return (
                    <button
                        key={option.value}
                        ref={(element) => {
                            buttonRefs.current[index] = element;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={isSelected ? 0 : -1}
                        onClick={() => onChange(option.value)}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className={cn(
                            'rounded-field focus-visible:ring-brand/20 border font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2',
                            size === 'sm' ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm',
                            isSelected
                                ? 'border-brand bg-brand text-brand-foreground'
                                : 'border-line bg-surface text-ink-soft hover:bg-surface-hover',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

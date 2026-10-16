import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useId, type ReactNode } from 'react';
import { Checkbox } from './checkbox';

export interface ChoiceOption {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
}

interface ChoiceGroupBaseProps {
    options: ChoiceOption[];
    /** Accessible name of the group, e.g. the field label. */
    label: string;
    /** "cards" shows each option as a bordered box (good for few options with descriptions). */
    variant?: 'list' | 'cards';
    orientation?: 'vertical' | 'horizontal';
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
}

function groupLayout(orientation: 'vertical' | 'horizontal', variant: 'list' | 'cards'): string {
    if (variant === 'cards') {
        return orientation === 'horizontal' ? 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-2';
    }

    return orientation === 'horizontal' ? 'flex flex-wrap gap-x-5 gap-y-2' : 'flex flex-col gap-2';
}

function OptionText({ option }: { option: ChoiceOption }): ReactNode {
    return (
        <span className="min-w-0">
            <span className="text-ink-soft block text-sm">{__(option.label)}</span>
            {option.description && <span className="text-ink-muted mt-0.5 block text-xs">{__(option.description)}</span>}
        </span>
    );
}

function optionClass(variant: 'list' | 'cards', isSelected: boolean, isDisabled: boolean): string {
    return cn(
        'flex cursor-pointer items-start gap-2.5',
        variant === 'cards' && 'rounded-field border p-3 transition-colors',
        variant === 'cards' && (isSelected ? 'border-brand bg-surface-muted' : 'border-line hover:bg-surface-hover'),
        isDisabled && 'cursor-not-allowed opacity-60',
    );
}

export interface RadioGroupProps extends ChoiceGroupBaseProps {
    name: string;
    value: string | null;
    onChange: (value: string) => void;
}

/**
 * Pick exactly one option. Uses native radio inputs (keyboard and screen readers work out of the box).
 */
export function RadioGroup({
    name,
    value,
    onChange,
    options,
    label,
    variant = 'list',
    orientation = 'vertical',
    disabled = false,
    invalid = false,
    className,
}: RadioGroupProps) {
    const baseId = useId();

    return (
        <div
            role="radiogroup"
            aria-label={__(label)}
            aria-invalid={invalid || undefined}
            className={cn(groupLayout(orientation, variant), className)}
        >
            {options.map((option, index) => {
                const id = `${baseId}-${index}`;
                const isSelected = option.value === value;
                const isDisabled = disabled || Boolean(option.disabled);

                return (
                    <label key={option.value} htmlFor={id} className={optionClass(variant, isSelected, isDisabled)}>
                        <input
                            id={id}
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => onChange(option.value)}
                            className={cn(
                                'border-line-strong bg-surface checked:border-brand focus-visible:ring-brand/20 mt-0.5 size-4 shrink-0 cursor-pointer appearance-none rounded-full border transition-colors checked:border-[5px] focus-visible:ring-2 focus-visible:outline-none',
                                invalid && 'border-danger',
                            )}
                        />
                        <OptionText option={option} />
                    </label>
                );
            })}
        </div>
    );
}

export interface CheckboxGroupProps extends ChoiceGroupBaseProps {
    value: string[];
    onChange: (value: string[]) => void;
}

/**
 * Pick any number of options. The value keeps the order of `options`.
 */
export function CheckboxGroup({
    value,
    onChange,
    options,
    label,
    variant = 'list',
    orientation = 'vertical',
    disabled = false,
    invalid = false,
    className,
}: CheckboxGroupProps) {
    const baseId = useId();
    const selected = new Set(value);

    const toggle = (optionValue: string) => {
        const next = new Set(selected);

        if (next.has(optionValue)) {
            next.delete(optionValue);
        } else {
            next.add(optionValue);
        }

        onChange(options.map((option) => option.value).filter((optionValue) => next.has(optionValue)));
    };

    return (
        <div role="group" aria-label={__(label)} aria-invalid={invalid || undefined} className={cn(groupLayout(orientation, variant), className)}>
            {options.map((option, index) => {
                const id = `${baseId}-${index}`;
                const isSelected = selected.has(option.value);
                const isDisabled = disabled || Boolean(option.disabled);

                return (
                    <label key={option.value} htmlFor={id} className={optionClass(variant, isSelected, isDisabled)}>
                        <Checkbox id={id} checked={isSelected} disabled={isDisabled} onChange={() => toggle(option.value)} className="mt-0.5" />
                        <OptionText option={option} />
                    </label>
                );
            })}
        </div>
    );
}

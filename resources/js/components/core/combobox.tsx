import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Combobox as HeadlessCombobox } from '@headlessui/react';
import { Check, ChevronsUpDown, LoaderCircle, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface ComboboxOptionItem {
    value: string;
    label: string;
    description?: string;
}

export interface ComboboxProps {
    options: ComboboxOptionItem[];
    value: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    /** Called while typing; use it to load options from the server. Without it options are filtered locally. */
    onSearch?: (query: string) => void;
    isLoading?: boolean;
    /** Shows a clear button when a value is selected. */
    clearable?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    id?: string;
    className?: string;
}

/**
 * Searchable select for long lists (clients, accounts, users…).
 * Headless UI handles keyboard navigation and ARIA; this file only styles it.
 */
export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Search…',
    onSearch,
    isLoading = false,
    clearable = false,
    disabled = false,
    invalid = false,
    id,
    className,
}: ComboboxProps) {
    const [query, setQuery] = useState('');
    const selected = options.find((option) => option.value === value) ?? null;

    const visibleOptions = useMemo(() => {
        const keyword = query.trim().toLowerCase();

        if (onSearch || !keyword) {
            return options;
        }

        return options.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(keyword));
    }, [options, query, onSearch]);

    return (
        <HeadlessCombobox
            value={selected}
            onChange={(option: ComboboxOptionItem | null) => onChange(option?.value ?? null)}
            onClose={() => setQuery('')}
            disabled={disabled}
            immediate
        >
            <div
                className={cn(
                    'rounded-field border-line bg-surface focus-within:border-line-strong focus-within:ring-brand/10 h-control relative flex w-full items-center border text-sm transition-colors focus-within:ring-2',
                    invalid && 'border-danger focus-within:border-danger focus-within:ring-danger/15',
                    disabled && 'cursor-not-allowed opacity-60',
                    className,
                )}
            >
                <ComboboxInput
                    id={id}
                    aria-invalid={invalid || undefined}
                    displayValue={(option: ComboboxOptionItem | null) => option?.label ?? ''}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        onSearch?.(event.target.value);
                    }}
                    placeholder={__(placeholder)}
                    autoComplete="off"
                    className="text-ink placeholder:text-ink-subtle h-full min-w-0 flex-1 bg-transparent pr-2 pl-3 outline-none"
                />
                {isLoading && <LoaderCircle className="text-ink-subtle mr-1 size-4 shrink-0 animate-spin" aria-hidden="true" />}
                {clearable && selected && !disabled && (
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        aria-label={__('Clear')}
                        className="text-ink-subtle hover:text-ink rounded-field inline-flex size-6 shrink-0 items-center justify-center"
                    >
                        <X className="size-3.5" />
                    </button>
                )}
                <ComboboxButton className="text-ink-subtle flex h-full shrink-0 items-center px-2" aria-label={__('Show options')}>
                    <ChevronsUpDown className="size-4" />
                </ComboboxButton>
            </div>

            <ComboboxOptions
                anchor="bottom start"
                transition
                className="rounded-field border-line bg-surface shadow-pop scrollbar-thin z-50 max-h-72 w-(--input-width) overflow-y-auto border p-1 text-sm outline-none [--anchor-gap:6px] empty:invisible data-closed:opacity-0"
            >
                {visibleOptions.length === 0 ? (
                    <div className="text-ink-muted px-2 py-2">{isLoading ? __('Loading') : __('No results')}</div>
                ) : (
                    visibleOptions.map((option) => (
                        <ComboboxOption
                            key={option.value}
                            value={option}
                            className="group data-focus:bg-surface-hover flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5"
                        >
                            <Check className="text-ink mt-0.5 size-4 shrink-0 opacity-0 group-data-selected:opacity-100" aria-hidden="true" />
                            <span className="min-w-0">
                                <span className="text-ink-soft block truncate group-data-selected:font-medium">{option.label}</span>
                                {option.description && <span className="text-ink-muted block truncate text-xs">{option.description}</span>}
                            </span>
                        </ComboboxOption>
                    ))
                )}
            </ComboboxOptions>
        </HeadlessCombobox>
    );
}

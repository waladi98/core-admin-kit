import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger, buttonVariants } from '@/components/core';
import { cn } from '@/lib/utils';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';

export interface PeriodOption<T extends string> {
    value: T;
    label: string;
}

export interface PeriodSelectProps<T extends string> {
    options: PeriodOption<T>[];
    value: T;
    onChange: (value: T) => void;
}

export function PeriodSelect<T extends string>({ options, value, onChange }: PeriodSelectProps<T>) {
    const selectedOption = options.find((option) => option.value === value);

    return (
        <Dropdown>
            <DropdownTrigger className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-1.5')}>
                <CalendarDays />
                {selectedOption?.label}
                <ChevronDown className="text-ink-subtle" />
            </DropdownTrigger>
            <DropdownContent className="min-w-40">
                {options.map((option) => (
                    <DropdownItem
                        key={option.value}
                        onSelect={() => onChange(option.value)}
                        icon={option.value === value ? <Check /> : <span className="size-4" />}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </Dropdown>
    );
}

export type ReportingPeriod = 'this_week' | 'last_week' | 'last_month' | 'last_quarter';

export const reportingPeriodOptions: PeriodOption<ReportingPeriod>[] = [
    { value: 'this_week', label: 'This week' },
    { value: 'last_week', label: 'Last week' },
    { value: 'last_month', label: 'Last month' },
    { value: 'last_quarter', label: 'Last quarter' },
];

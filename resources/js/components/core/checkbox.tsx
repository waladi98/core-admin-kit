import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';
import { type ComponentProps, useEffect, useRef } from 'react';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
    indeterminate?: boolean;
}

export function Checkbox({ className, indeterminate = false, checked, ...props }: CheckboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    const isMarked = Boolean(checked) || indeterminate;

    return (
        <span className={cn('relative inline-flex size-4 shrink-0', className)}>
            <input
                ref={inputRef}
                type="checkbox"
                checked={checked}
                className="peer border-line-strong bg-surface checked:border-brand checked:bg-brand indeterminate:border-brand indeterminate:bg-brand focus-visible:ring-brand/20 size-4 cursor-pointer appearance-none rounded-[4px] border transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                {...props}
            />
            {isMarked && (
                <span className="text-brand-foreground pointer-events-none absolute inset-0 flex items-center justify-center">
                    {indeterminate ? <Minus className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
                </span>
            )}
        </span>
    );
}

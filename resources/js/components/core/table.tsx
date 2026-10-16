import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export interface TableProps extends ComponentProps<'table'> {
    /** Classes for the scroll container around the table. */
    containerClassName?: string;
}

export function Table({ className, containerClassName, ...props }: TableProps) {
    return (
        <div className={cn('scrollbar-thin w-full overflow-x-auto', containerClassName)}>
            <table className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
        </div>
    );
}

export function TableHead({ className, ...props }: ComponentProps<'thead'>) {
    return <thead className={cn('bg-surface-muted', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
    return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
    return <tr className={cn('border-line data-[selected=true]:bg-surface-muted/60 border-b transition-colors', className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ComponentProps<'th'>) {
    return <th className={cn('text-ink-muted h-9 px-3 text-left align-middle text-xs font-medium whitespace-nowrap', className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
    return <td className={cn('text-ink-soft h-10 px-3 align-middle text-[13px] whitespace-nowrap', className)} {...props} />;
}

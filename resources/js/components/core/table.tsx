import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

export function Table({ className, ...props }: ComponentProps<'table'>) {
    return (
        <div className="w-full overflow-x-auto">
            <table className={cn('w-full caption-bottom border-collapse text-sm', className)} {...props} />
        </div>
    );
}

export function TableHead({ className, ...props }: ComponentProps<'thead'>) {
    return <thead className={cn('bg-surface-muted/60', className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
    return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
    return <tr className={cn('border-line data-[selected=true]:bg-surface-muted/60 border-b transition-colors', className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ComponentProps<'th'>) {
    return <th className={cn('text-ink-muted h-10 px-3 text-left align-middle text-xs font-medium whitespace-nowrap', className)} {...props} />;
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
    return <td className={cn('text-ink-soft h-12 px-3 align-middle whitespace-nowrap', className)} {...props} />;
}

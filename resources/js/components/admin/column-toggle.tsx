import { Checkbox, Popover, PopoverContent, PopoverTrigger, buttonVariants } from '@/components/core';
import { type ColumnVisibility } from '@/hooks/use-column-visibility';
import { __ } from '@/lib/i18n';
import { Columns3 } from 'lucide-react';

/**
 * "Columns" button that shows or hides table columns (see useColumnVisibility).
 */
export function ColumnToggle<T>({ visibility }: { visibility: ColumnVisibility<T> }) {
    return (
        <Popover>
            <PopoverTrigger className={buttonVariants({ variant: 'secondary', size: 'sm' })} aria-label={__('Choose columns')}>
                <Columns3 />
                <span className="hidden sm:inline">{__('Columns')}</span>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1">
                <p className="text-ink-muted px-2 py-1.5 text-xs font-medium">{__('Show columns')}</p>
                {visibility.hideableColumns.map((column) => (
                    <label
                        key={column.key}
                        className="hover:bg-surface-hover rounded-field flex cursor-pointer items-center gap-2.5 px-2 py-1.5 text-sm"
                    >
                        <Checkbox checked={visibility.isVisible(column.key)} onChange={() => visibility.toggle(column.key)} />
                        <span className="text-ink-soft">{__(column.header)}</span>
                    </label>
                ))}
                <div className="border-line mt-1 border-t pt-1">
                    <button
                        type="button"
                        onClick={visibility.reset}
                        className="text-ink-soft hover:bg-surface-hover rounded-field w-full px-2 py-1.5 text-left text-xs font-medium"
                    >
                        {__('Reset columns')}
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}

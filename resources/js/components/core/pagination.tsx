import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, LoaderCircle } from 'lucide-react';
import { type ReactNode } from 'react';

export interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    /** Page currently being requested; shows a spinner on it and disables the others. */
    loadingPage?: number | null;
    /** Optional summary, e.g. from Laravel's paginator `from`, `to` and `total`. */
    from?: number | null;
    to?: number | null;
    total?: number;
    className?: string;
}

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

/**
 * Pages to show: always the first and last page, plus one neighbour on each side of the current page.
 */
export function getPageItems(currentPage: number, lastPage: number): PageItem[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    const items: PageItem[] = [1];

    if (start > 2) {
        items.push('ellipsis-start');
    }

    for (let page = start; page <= end; page++) {
        items.push(page);
    }

    if (end < lastPage - 1) {
        items.push('ellipsis-end');
    }

    items.push(lastPage);

    return items;
}

const pageButtonClass =
    'rounded-field inline-flex h-8 min-w-8 items-center justify-center px-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4';

export function Pagination({ currentPage, lastPage, onPageChange, loadingPage = null, from, to, total, className }: PaginationProps) {
    const isBusy = loadingPage !== null;

    if (lastPage <= 1 && total === undefined) {
        return null;
    }

    const renderNavButton = (page: number, label: string, icon: ReactNode, isDisabled: boolean) => (
        <button
            type="button"
            aria-label={label}
            onClick={() => onPageChange(page)}
            disabled={isDisabled || isBusy}
            className={cn(pageButtonClass, 'text-ink-soft hover:bg-surface-hover')}
        >
            {loadingPage === page ? <LoaderCircle className="animate-spin" /> : icon}
        </button>
    );

    return (
        <nav aria-label="Pagination" className={cn('flex flex-col items-center justify-between gap-3 sm:flex-row', className)}>
            {total !== undefined && (
                <p className="text-ink-muted text-sm">
                    {total === 0 ? (
                        'No results'
                    ) : (
                        <>
                            Showing <span className="text-ink font-medium">{from}</span>–<span className="text-ink font-medium">{to}</span> of{' '}
                            <span className="text-ink font-medium">{total}</span>
                        </>
                    )}
                </p>
            )}

            {lastPage > 1 && (
                <div className="flex items-center gap-1">
                    {renderNavButton(currentPage - 1, 'Previous page', <ChevronLeft />, currentPage <= 1)}
                    {getPageItems(currentPage, lastPage).map((item) => {
                        if (typeof item !== 'number') {
                            return (
                                <span
                                    key={item}
                                    className="text-ink-subtle inline-flex h-8 min-w-8 items-center justify-center text-sm"
                                    aria-hidden="true"
                                >
                                    …
                                </span>
                            );
                        }

                        const isCurrent = item === currentPage;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                aria-current={isCurrent ? 'page' : undefined}
                                aria-label={`Page ${item}`}
                                disabled={isCurrent || isBusy}
                                className={cn(
                                    pageButtonClass,
                                    isCurrent ? 'bg-brand text-brand-foreground disabled:opacity-100' : 'text-ink-soft hover:bg-surface-hover',
                                    loadingPage === item && 'disabled:opacity-100',
                                )}
                            >
                                {loadingPage === item ? <LoaderCircle className="animate-spin" /> : item}
                            </button>
                        );
                    })}
                    {renderNavButton(currentPage + 1, 'Next page', <ChevronRight />, currentPage >= lastPage)}
                </div>
            )}
        </nav>
    );
}

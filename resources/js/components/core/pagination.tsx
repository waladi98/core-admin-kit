import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, LoaderCircle } from 'lucide-react';
import { type ReactNode } from 'react';
import { Select } from './select';

export const PER_PAGE_OPTIONS = [10, 25, 50, 100];

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
    /** Shows an "entries per page" select when both are set. */
    perPage?: number;
    onPerPageChange?: (perPage: number) => void;
    perPageOptions?: number[];
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
    'rounded-field inline-flex h-7 min-w-7 items-center justify-center px-1.5 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-3.5';

export function Pagination({
    currentPage,
    lastPage,
    onPageChange,
    loadingPage = null,
    from,
    to,
    total,
    perPage,
    onPerPageChange,
    perPageOptions = PER_PAGE_OPTIONS,
    className,
}: PaginationProps) {
    const isBusy = loadingPage !== null;
    const pageCount = Math.max(lastPage, 1);
    const hasPerPage = perPage !== undefined && onPerPageChange !== undefined;

    const renderNavButton = (page: number, label: string, icon: ReactNode, isDisabled: boolean) => (
        <button
            type="button"
            aria-label={label}
            onClick={() => onPageChange(page)}
            disabled={isDisabled || isBusy}
            className={cn(pageButtonClass, 'text-ink-muted hover:bg-surface-hover hover:text-ink')}
        >
            {loadingPage === page ? <LoaderCircle className="animate-spin" /> : icon}
        </button>
    );

    return (
        <nav aria-label={__('Pagination')} className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between', className)}>
            <div className="text-ink-muted flex items-center gap-2 text-xs">
                {hasPerPage && (
                    <>
                        <Select
                            size="sm"
                            aria-label={__('Entries per page')}
                            options={perPageOptions.map((option) => ({ value: String(option), label: String(option) }))}
                            value={String(perPage)}
                            onChange={(event) => onPerPageChange(Number(event.target.value))}
                            disabled={isBusy}
                            wrapperClassName="w-18"
                        />
                        <span>{__('entries per page')}</span>
                    </>
                )}
                {total !== undefined && (
                    <span>
                        {hasPerPage && <span className="text-line-strong mr-2">·</span>}
                        {total === 0 ? (
                            __('No results')
                        ) : (
                            <>
                                <span className="text-ink-soft font-medium">{from}</span>–<span className="text-ink-soft font-medium">{to}</span>{' '}
                                {__('of')} <span className="text-ink-soft font-medium">{total}</span>
                            </>
                        )}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-0.5">
                {renderNavButton(1, __('First page'), <ChevronsLeft />, currentPage <= 1)}
                {renderNavButton(currentPage - 1, __('Previous page'), <ChevronLeft />, currentPage <= 1)}
                {getPageItems(currentPage, pageCount).map((item) => {
                    if (typeof item !== 'number') {
                        return (
                            <span
                                key={item}
                                className="text-ink-subtle inline-flex h-7 min-w-7 items-center justify-center text-xs"
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
                            aria-label={__('Page :page', { page: item })}
                            disabled={isCurrent || isBusy}
                            className={cn(
                                pageButtonClass,
                                isCurrent
                                    ? 'bg-brand text-brand-foreground font-medium disabled:opacity-100'
                                    : 'text-ink-soft hover:bg-surface-hover',
                                loadingPage === item && 'disabled:opacity-100',
                            )}
                        >
                            {loadingPage === item ? <LoaderCircle className="animate-spin" /> : item}
                        </button>
                    );
                })}
                {renderNavButton(currentPage + 1, __('Next page'), <ChevronRight />, currentPage >= pageCount)}
                {renderNavButton(pageCount, __('Last page'), <ChevronsRight />, currentPage >= pageCount)}
            </div>
        </nav>
    );
}

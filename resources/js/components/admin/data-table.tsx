import { Checkbox, Skeleton, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/core';
import { cn } from '@/lib/utils';
import { type TableSort } from '@/types/table';
import { ArrowDown, ArrowUp, ArrowUpDown, Inbox, LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export interface DataTableColumn<T> {
    key: string;
    header: string;
    cell: (row: T) => ReactNode;
    /** Value used for client-side sorting. Setting it makes the column sortable. */
    sortValue?: (row: T) => string | number;
    /** Marks the column sortable when sorting happens on the server (controlled `sort`). */
    sortable?: boolean;
    /** Skeleton shape shown while the first page loads. */
    skeleton?: 'text' | 'avatar' | 'badge';
    className?: string;
}

export interface DataTableProps<T> {
    rows: T[];
    columns: DataTableColumn<T>[];
    getRowId: (row: T) => string;
    selectable?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
    rowActions?: (row: T) => ReactNode;
    /**
     * With no rows: shows skeleton rows. With rows: dims them and shows a
     * progress bar under the header (sort, search, filter or page change).
     */
    isLoading?: boolean;
    skeletonRows?: number;
    /** Rows with an action in progress (e.g. delete). Removed pending rows fade out. */
    pendingRowIds?: string[];
    /** Controlled sort for server-side sorting. Leave undefined for client-side sorting. */
    sort?: TableSort | null;
    onSortChange?: (sort: TableSort | null) => void;
    emptyState?: ReactNode;
    emptyMessage?: string;
}

/** Later rows share the last delay so long pages do not feel slow. */
const MAX_STAGGERED_ROWS = 10;
const ROW_STAGGER_MS = 20;
const ROW_EXIT_MS = 200;

const skeletonWidths = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6'];

function nextSort(current: TableSort | null, key: string): TableSort | null {
    if (current?.key !== key) {
        return { key, direction: 'asc' };
    }

    return current.direction === 'asc' ? { key, direction: 'desc' } : null;
}

function SkeletonCell({ shape, index }: { shape?: DataTableColumn<unknown>['skeleton']; index: number }) {
    if (shape === 'avatar') {
        return (
            <span className="flex items-center gap-2">
                <Skeleton shape="circle" className="size-6 shrink-0" />
                <Skeleton shape="text" className="w-24" />
            </span>
        );
    }

    if (shape === 'badge') {
        return <Skeleton className="h-5 w-16" />;
    }

    return <Skeleton shape="text" className={skeletonWidths[index % skeletonWidths.length]} />;
}

export function DataTable<T>({
    rows,
    columns,
    getRowId,
    selectable = false,
    selectedIds = [],
    onSelectionChange,
    rowActions,
    isLoading = false,
    skeletonRows = 5,
    pendingRowIds = [],
    sort: controlledSort,
    onSortChange,
    emptyState,
    emptyMessage = 'No data found.',
}: DataTableProps<T>) {
    const isServerSorted = controlledSort !== undefined;
    const [clientSort, setClientSort] = useState<TableSort | null>(null);
    const sort = isServerSorted ? controlledSort : clientSort;
    const [sortingKey, setSortingKey] = useState<string | null>(null);

    const sortedRows = useMemo(() => {
        const column = columns.find((candidate) => candidate.key === sort?.key);

        if (isServerSorted || !sort || !column?.sortValue) {
            return rows;
        }

        const getValue = column.sortValue;
        const directionFactor = sort.direction === 'asc' ? 1 : -1;

        return [...rows].sort((first, second) => {
            const firstValue = getValue(first);
            const secondValue = getValue(second);

            if (typeof firstValue === 'number' && typeof secondValue === 'number') {
                return (firstValue - secondValue) * directionFactor;
            }

            return String(firstValue).localeCompare(String(secondValue)) * directionFactor;
        });
    }, [rows, columns, sort, isServerSorted]);

    const exitingRows = useExitingRows(rows, getRowId, pendingRowIds);

    /**
     * Rows animate in only the first time data appears. Later sort, filter and
     * page changes swap rows instantly; the dimmed reload state is feedback enough.
     */
    const hasShownRows = useRef(false);
    const shouldAnimateRows = !hasShownRows.current;

    useEffect(() => {
        if (rows.length > 0) {
            hasShownRows.current = true;
        }
    }, [rows]);

    useEffect(() => {
        setSortingKey(null);
    }, [rows]);

    const handleSort = (key: string) => {
        const updatedSort = nextSort(sort, key);

        if (isServerSorted) {
            setSortingKey(key);
            onSortChange?.(updatedSort);
        } else {
            setClientSort(updatedSort);
        }
    };

    const visibleIds = sortedRows.map(getRowId);
    const selectedVisibleCount = visibleIds.filter((id) => selectedIds.includes(id)).length;
    const isAllSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
    const isPartiallySelected = selectedVisibleCount > 0 && !isAllSelected;

    const toggleAll = () => {
        const otherIds = selectedIds.filter((id) => !visibleIds.includes(id));
        onSelectionChange?.(isAllSelected ? otherIds : [...otherIds, ...visibleIds]);
    };

    const toggleRow = (id: string) => {
        onSelectionChange?.(selectedIds.includes(id) ? selectedIds.filter((selectedId) => selectedId !== id) : [...selectedIds, id]);
    };

    const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
    const isInitialLoading = isLoading && sortedRows.length === 0;
    const isReloading = isLoading && sortedRows.length > 0;

    const displayedRows = [...sortedRows.map((row) => ({ row, isExiting: false }))];
    exitingRows.forEach(({ row, index }) => displayedRows.splice(Math.min(index, displayedRows.length), 0, { row, isExiting: true }));

    return (
        <Table aria-busy={isLoading || undefined}>
            <TableHead>
                <TableRow className="border-b-0">
                    {selectable && (
                        <TableHeaderCell className="w-10">
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isPartiallySelected}
                                onChange={toggleAll}
                                disabled={isLoading}
                                aria-label="Select all rows"
                            />
                        </TableHeaderCell>
                    )}
                    {columns.map((column) => {
                        const isSortable = Boolean(column.sortValue) || Boolean(column.sortable && isServerSorted);
                        const isSorted = sort?.key === column.key;
                        const isSortPending = isLoading && sortingKey === column.key;
                        const SortIcon = isSortPending ? LoaderCircle : !isSorted ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;

                        return (
                            <TableHeaderCell
                                key={column.key}
                                className={column.className}
                                aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                            >
                                {isSortable ? (
                                    <button
                                        type="button"
                                        onClick={() => handleSort(column.key)}
                                        disabled={isInitialLoading}
                                        className="hover:text-ink inline-flex items-center gap-1.5 transition-colors disabled:pointer-events-none"
                                    >
                                        {column.header}
                                        <SortIcon
                                            className={cn(
                                                'size-3.5',
                                                isSortPending && 'animate-spin',
                                                isSorted || isSortPending ? 'text-ink' : 'text-ink-subtle',
                                            )}
                                        />
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </TableHeaderCell>
                        );
                    })}
                    {rowActions && <TableHeaderCell className="w-12" aria-label="Actions" />}
                </TableRow>
                <tr aria-hidden="true">
                    <td colSpan={columnCount} className="border-line relative h-0.5 overflow-hidden border-b p-0">
                        {isReloading && <span className="animate-progress bg-brand absolute inset-y-0 left-0 block w-2/5 rounded-full" />}
                    </td>
                </tr>
            </TableHead>
            <TableBody className={cn('transition-opacity duration-200', isReloading && 'pointer-events-none opacity-50')}>
                {isInitialLoading &&
                    Array.from({ length: skeletonRows }, (_, rowIndex) => (
                        <TableRow key={`skeleton-${rowIndex}`}>
                            {selectable && (
                                <TableCell>
                                    <Skeleton className="size-4" />
                                </TableCell>
                            )}
                            {columns.map((column, columnIndex) => (
                                <TableCell key={column.key} className={column.className}>
                                    <SkeletonCell shape={column.skeleton} index={rowIndex + columnIndex} />
                                </TableCell>
                            ))}
                            {rowActions && (
                                <TableCell>
                                    <Skeleton className="ml-auto size-6" />
                                </TableCell>
                            )}
                        </TableRow>
                    ))}

                {!isLoading && displayedRows.length === 0 && (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={columnCount} className="h-auto py-10 whitespace-normal">
                            <div className="animate-enter flex flex-col items-center gap-2 text-center">
                                {emptyState ?? (
                                    <>
                                        <span className="border-line bg-surface-muted rounded-field flex size-10 items-center justify-center border">
                                            <Inbox className="text-ink-subtle size-5" />
                                        </span>
                                        <p className="text-ink-muted text-sm">{emptyMessage}</p>
                                    </>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                )}

                {!isInitialLoading &&
                    displayedRows.map(({ row, isExiting }, index) => {
                        const id = getRowId(row);
                        const isSelected = selectedIds.includes(id);
                        const isPending = pendingRowIds.includes(id);

                        return (
                            <TableRow
                                key={isExiting ? `exiting-${id}` : id}
                                data-selected={isSelected}
                                data-pending={isPending || isExiting || undefined}
                                className={cn(
                                    'hover:bg-surface-muted/40 transition-opacity duration-200',
                                    isExiting && 'animate-out fade-out-0 fill-mode-forwards pointer-events-none duration-200',
                                    !isExiting && shouldAnimateRows && 'animate-fade',
                                    isPending && 'pointer-events-none opacity-50',
                                )}
                                style={{ '--enter-delay': `${Math.min(index, MAX_STAGGERED_ROWS) * ROW_STAGGER_MS}ms` } as CSSProperties}
                            >
                                {selectable && (
                                    <TableCell>
                                        <Checkbox checked={isSelected} onChange={() => toggleRow(id)} aria-label={`Select row ${id}`} />
                                    </TableCell>
                                )}
                                {columns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.cell(row)}
                                    </TableCell>
                                ))}
                                {rowActions && (
                                    <TableCell className="text-right">
                                        {isPending ? (
                                            <LoaderCircle className="text-ink-muted ml-auto size-4 animate-spin" aria-label="Processing" />
                                        ) : (
                                            rowActions(row)
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
            </TableBody>
        </Table>
    );
}

/**
 * Keeps rows that were pending (e.g. being deleted) for a short moment after
 * they disappear from `rows`, so they can fade out instead of vanishing.
 */
function useExitingRows<T>(rows: T[], getRowId: (row: T) => string, pendingRowIds: string[]): { row: T; index: number }[] {
    const [exitingRows, setExitingRows] = useState<{ row: T; index: number }[]>([]);
    const previousRows = useRef(rows);
    const everPendingIds = useRef(new Set<string>());

    pendingRowIds.forEach((id) => everPendingIds.current.add(id));

    useEffect(() => {
        const currentIds = new Set(rows.map(getRowId));
        const removedRows = previousRows.current
            .map((row, index) => ({ row, index }))
            .filter(({ row }) => {
                const id = getRowId(row);

                return !currentIds.has(id) && everPendingIds.current.has(id);
            });

        previousRows.current = rows;

        if (removedRows.length === 0) {
            return;
        }

        removedRows.forEach(({ row }) => everPendingIds.current.delete(getRowId(row)));
        setExitingRows(removedRows);

        const timer = setTimeout(() => setExitingRows([]), ROW_EXIT_MS);

        return () => clearTimeout(timer);
        // getRowId is expected to be stable in behavior; only row changes matter here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows]);

    return exitingRows;
}

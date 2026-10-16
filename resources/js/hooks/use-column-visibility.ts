import { type DataTableColumn } from '@/components/admin/data-table';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';

export interface ColumnVisibility<T> {
    /** Columns to pass to DataTable. */
    visibleColumns: DataTableColumn<T>[];
    /** Columns the user may hide or show (for ColumnToggle). */
    hideableColumns: DataTableColumn<T>[];
    isVisible: (key: string) => boolean;
    toggle: (key: string) => void;
    reset: () => void;
}

function readHidden(storageKey: string): string[] | null {
    try {
        const stored = window.localStorage.getItem(storageKey);

        return stored ? (JSON.parse(stored) as string[]) : null;
    } catch {
        return null;
    }
}

function writeHidden(storageKey: string, hidden: string[]): void {
    try {
        window.localStorage.setItem(storageKey, JSON.stringify(hidden));
    } catch {
        // Storage may be unavailable (private mode); the choice just is not remembered.
    }
}

/**
 * Lets people choose which table columns to show. The choice is remembered in this
 * browser, per signed-in user and per table. Columns with `hideable: false` always show.
 *
 * ```tsx
 * const columnVisibility = useColumnVisibility('users', columns);
 * <ColumnToggle visibility={columnVisibility} />
 * <DataTable columns={columnVisibility.visibleColumns} … />
 * ```
 */
export function useColumnVisibility<T>(tableKey: string, columns: DataTableColumn<T>[], defaultHidden: string[] = []): ColumnVisibility<T> {
    const { auth } = usePage<SharedData>().props;
    const storageKey = `finance-core.columns.${auth.user?.id ?? 'guest'}.${tableKey}`;
    const [hidden, setHidden] = useState<string[]>(() => (typeof window === 'undefined' ? defaultHidden : (readHidden(storageKey) ?? defaultHidden)));

    const toggle = useCallback(
        (key: string) => {
            setHidden((current) => {
                const next = current.includes(key) ? current.filter((hiddenKey) => hiddenKey !== key) : [...current, key];
                writeHidden(storageKey, next);

                return next;
            });
        },
        [storageKey],
    );

    const reset = useCallback(() => {
        writeHidden(storageKey, defaultHidden);
        setHidden(defaultHidden);
    }, [storageKey, defaultHidden]);

    return useMemo(
        () => ({
            visibleColumns: columns.filter((column) => column.hideable === false || !hidden.includes(column.key)),
            hideableColumns: columns.filter((column) => column.hideable !== false),
            isVisible: (key: string) => !hidden.includes(key),
            toggle,
            reset,
        }),
        [columns, hidden, toggle, reset],
    );
}

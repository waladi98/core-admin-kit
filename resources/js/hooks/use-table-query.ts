import { type TableSort } from '@/types/table';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TableFilters = Record<string, string | null>;

export interface TableQuery<TFilters extends TableFilters> {
    search: string;
    sort: TableSort | null;
    page: number;
    filters: TFilters;
}

export interface UseTableQueryOptions<TFilters extends TableFilters> {
    /** URL of the index page, e.g. route('users.index'). */
    url: string;
    /** Props to reload, e.g. ['users', 'filters']. */
    only: string[];
    initial: TableQuery<TFilters>;
    /** Wait this long after the last keystroke before searching. */
    searchDelay?: number;
    /** Loading indicators only appear after this delay to avoid flicker. */
    loadingDelay?: number;
}

export interface UseTableQueryResult<TFilters extends TableFilters> {
    /** Current query. Updates immediately on user input, before the server responds. */
    query: TableQuery<TFilters>;
    setSearch: (search: string) => void;
    setFilter: <K extends keyof TFilters>(key: K, value: TFilters[K]) => void;
    setSort: (sort: TableSort | null) => void;
    setPage: (page: number) => void;
    reset: () => void;
    /** True while a reload is in flight (after `loadingDelay`). Pass to DataTable `isLoading`. */
    isLoading: boolean;
    /** True from the first keystroke until the search results arrive. */
    isSearching: boolean;
    /** Page being requested. Pass to Pagination `loadingPage`. */
    loadingPage: number | null;
    hasActiveFilters: boolean;
}

/**
 * Converts the query into Laravel-friendly query string params:
 * `?search=…&sort=name` (or `-name` for descending) `&page=2&role=admin`.
 */
export function toQueryParams<TFilters extends TableFilters>(query: TableQuery<TFilters>): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (query.search.trim()) {
        params.search = query.search.trim();
    }

    if (query.sort) {
        params.sort = query.sort.direction === 'desc' ? `-${query.sort.key}` : query.sort.key;
    }

    if (query.page > 1) {
        params.page = query.page;
    }

    Object.entries(query.filters).forEach(([key, value]) => {
        if (value !== null && value !== '') {
            params[key] = value;
        }
    });

    return params;
}

/**
 * Drives a server-side table (search, filters, sort and pagination) with
 * Inertia partial reloads, and exposes loading state for DataTable and Pagination.
 */
export function useTableQuery<TFilters extends TableFilters>({
    url,
    only,
    initial,
    searchDelay = 300,
    loadingDelay = 200,
}: UseTableQueryOptions<TFilters>): UseTableQueryResult<TFilters> {
    const [query, setQuery] = useState(initial);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingPage, setLoadingPage] = useState<number | null>(null);

    const queryRef = useRef(query);
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const loadingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const initialQuery = useRef(initial);

    useEffect(
        () => () => {
            clearTimeout(searchTimer.current);
            clearTimeout(loadingTimer.current);
        },
        [],
    );

    const visit = useCallback(
        (nextQuery: TableQuery<TFilters>) => {
            router.get(url, toQueryParams(nextQuery), {
                only,
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => {
                    clearTimeout(loadingTimer.current);
                    loadingTimer.current = setTimeout(() => setIsLoading(true), loadingDelay);
                },
                onFinish: () => {
                    clearTimeout(loadingTimer.current);
                    setIsLoading(false);
                    setIsSearching(false);
                    setLoadingPage(null);
                },
            });
        },
        // `only` is usually an inline array; its contents are what matter.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [url, only.join(','), loadingDelay],
    );

    const update = useCallback(
        (changes: Partial<TableQuery<TFilters>>, options: { debounce?: boolean } = {}) => {
            const nextQuery = { ...queryRef.current, ...changes };
            queryRef.current = nextQuery;
            setQuery(nextQuery);
            clearTimeout(searchTimer.current);

            if (options.debounce) {
                searchTimer.current = setTimeout(() => visit(queryRef.current), searchDelay);

                return;
            }

            visit(nextQuery);
        },
        [visit, searchDelay],
    );

    const setSearch = useCallback(
        (search: string) => {
            setIsSearching(true);
            update({ search, page: 1 }, { debounce: true });
        },
        [update],
    );

    const setFilter = useCallback(
        <K extends keyof TFilters>(key: K, value: TFilters[K]) => {
            update({ filters: { ...queryRef.current.filters, [key]: value }, page: 1 });
        },
        [update],
    );

    const setSort = useCallback((sort: TableSort | null) => update({ sort, page: 1 }), [update]);

    const setPage = useCallback(
        (page: number) => {
            setLoadingPage(page);
            update({ page });
        },
        [update],
    );

    const reset = useCallback(() => {
        const emptyFilters = Object.fromEntries(Object.keys(initialQuery.current.filters).map((key) => [key, null])) as TFilters;
        update({ search: '', sort: null, page: 1, filters: emptyFilters });
    }, [update]);

    const hasActiveFilters = query.search.trim() !== '' || Object.values(query.filters).some((value) => value !== null && value !== '');

    return { query, setSearch, setFilter, setSort, setPage, reset, isLoading, isSearching, loadingPage, hasActiveFilters };
}

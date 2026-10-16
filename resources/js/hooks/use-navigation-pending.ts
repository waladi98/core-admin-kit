import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export interface NavigationPendingState {
    /** True while a page navigation takes longer than `delay`. */
    isPending: boolean;
    /** True while a page navigation takes longer than `slowAfter`, e.g. on a poor connection. */
    isSlow: boolean;
    /** Path being navigated to, e.g. "/settings/profile". Known immediately, without the delay. */
    pendingPath: string | null;
}

export interface NavigationPendingOptions {
    delay?: number;
    slowAfter?: number;
}

/**
 * Tracks full page navigations (GET visits that are not partial reloads).
 * Partial reloads such as table filters are handled by useReloading / useTableQuery,
 * and form submissions by the submit button's own loading state.
 */
export function useNavigationPending({ delay = 250, slowAfter = 8000 }: NavigationPendingOptions = {}): NavigationPendingState {
    const [isPending, setIsPending] = useState(false);
    const [isSlow, setIsSlow] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);

    useEffect(() => {
        let pendingTimer: ReturnType<typeof setTimeout> | undefined;
        let slowTimer: ReturnType<typeof setTimeout> | undefined;

        const clearTimers = () => {
            clearTimeout(pendingTimer);
            clearTimeout(slowTimer);
        };

        const removeStartListener = router.on('start', (event) => {
            const { visit } = event.detail;
            // Inertia fires "start" for hover prefetches too; those must not dim the page.
            const isPageNavigation = !visit.prefetch && visit.method === 'get' && visit.only.length === 0 && visit.except.length === 0;

            if (!isPageNavigation) {
                return;
            }

            clearTimers();
            setPendingPath(visit.url.pathname);
            pendingTimer = setTimeout(() => setIsPending(true), delay);
            slowTimer = setTimeout(() => setIsSlow(true), slowAfter);
        });

        const removeFinishListener = router.on('finish', (event) => {
            if (event.detail.visit.prefetch) {
                return;
            }

            clearTimers();
            setIsPending(false);
            setIsSlow(false);
            setPendingPath(null);
        });

        return () => {
            clearTimers();
            removeStartListener();
            removeFinishListener();
        };
    }, [delay, slowAfter]);

    return { isPending, isSlow, pendingPath };
}

import { router } from '@inertiajs/react';
import { LoaderCircle, WifiOff } from 'lucide-react';

/**
 * Small toast shown when a page navigation is taking unusually long.
 * The visit keeps running; the user can cancel it and stay on the current page.
 */
export function SlowConnectionNotice({ isVisible }: { isVisible: boolean }) {
    if (!isVisible) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="animate-enter border-line bg-surface shadow-pop rounded-field fixed right-4 bottom-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 border py-2.5 pr-2 pl-3 text-sm"
        >
            <span className="bg-warning-soft text-warning flex size-8 shrink-0 items-center justify-center rounded-full">
                <WifiOff className="size-4" />
            </span>
            <div className="min-w-0">
                <p className="text-ink font-medium">Slow connection</p>
                <p className="text-ink-muted flex items-center gap-1.5 text-xs">
                    <LoaderCircle className="size-3 animate-spin" />
                    Still loading the page…
                </p>
            </div>
            <button
                type="button"
                onClick={() => router.cancel()}
                className="text-ink-soft hover:bg-surface-hover hover:text-ink rounded-field ml-2 h-8 px-2.5 text-xs font-medium transition-colors"
            >
                Cancel
            </button>
        </div>
    );
}

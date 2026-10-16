import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastApi {
    show: (type: ToastType, message: string, id?: string) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Older toasts are dropped beyond this many. */
const MAX_TOASTS = 4;
/** Errors stay longer so they can be read. */
const DURATION_MS: Record<ToastType, number> = { success: 4000, info: 5000, warning: 6000, error: 8000 };

const toastStyles: Record<ToastType, { icon: LucideIcon; iconClass: string }> = {
    success: { icon: CircleCheck, iconClass: 'text-success' },
    error: { icon: CircleAlert, iconClass: 'text-danger' },
    warning: { icon: TriangleAlert, iconClass: 'text-warning' },
    info: { icon: Info, iconClass: 'text-info' },
};

let fallbackId = 0;

/**
 * Holds the toast stack. Wrap the app shell with it (AdminLayout and the auth layout do).
 */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismiss = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);

    const show = useCallback((type: ToastType, message: string, id?: string) => {
        const toastId = id ?? `toast-${Date.now()}-${fallbackId++}`;

        setToasts((current) =>
            current.some((toast) => toast.id === toastId) ? current : [...current, { id: toastId, type, message }].slice(-MAX_TOASTS),
        );
    }, []);

    const api = useMemo<ToastApi>(
        () => ({
            show,
            dismiss,
            success: (message) => show('success', message),
            error: (message) => show('error', message),
            warning: (message) => show('warning', message),
            info: (message) => show('info', message),
        }),
        [show, dismiss],
    );

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div
                aria-live="polite"
                aria-label={__('Notifications')}
                className="pointer-events-none fixed top-[calc(var(--spacing-topbar)+0.5rem)] right-4 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
            >
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
    const style = toastStyles[toast.type];
    const Icon = style.icon;
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const startTimer = useCallback(() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onDismiss(toast.id), DURATION_MS[toast.type]);
    }, [onDismiss, toast.id, toast.type]);

    useEffect(() => {
        startTimer();

        return () => clearTimeout(timer.current);
    }, [startTimer]);

    return (
        <div
            role={toast.type === 'error' ? 'alert' : 'status'}
            onMouseEnter={() => clearTimeout(timer.current)}
            onMouseLeave={startTimer}
            className="animate-enter border-line bg-surface shadow-pop rounded-field pointer-events-auto flex items-start gap-3 border p-3 text-sm"
        >
            <Icon className={cn('mt-0.5 size-4 shrink-0', style.iconClass)} aria-hidden="true" />
            <p className="text-ink min-w-0 flex-1">{toast.message}</p>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label={__('Close')}
                className="text-ink-muted hover:bg-surface-hover hover:text-ink rounded-field -m-1 inline-flex size-6 shrink-0 items-center justify-center transition-colors"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}

/**
 * Show a toast from anywhere inside ToastProvider:
 * `const toast = useToast(); toast.success(t('Saved'));`
 * Server-side messages use `->withToast()` on a redirect instead.
 */
export function useToast(): ToastApi {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used inside <ToastProvider>.');
    }

    return context;
}

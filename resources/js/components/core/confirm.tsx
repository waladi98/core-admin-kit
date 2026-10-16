import { __ } from '@/lib/i18n';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Button } from './button';
import { Modal, ModalFooter } from './modal';

export interface ConfirmOptions {
    title: string;
    description?: string;
    /** Text of the confirm button. Defaults to "Confirm". */
    confirmLabel?: string;
    cancelLabel?: string;
    /** "danger" makes the confirm button red, for deletions. */
    tone?: 'default' | 'danger';
}

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFunction | null>(null);

/**
 * Renders one shared confirmation dialog. Wrap the app shell with it (AdminLayout does).
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const resolver = useRef<((confirmed: boolean) => void) | null>(null);

    const confirm = useCallback<ConfirmFunction>((nextOptions) => {
        resolver.current?.(false);
        setOptions(nextOptions);

        return new Promise<boolean>((resolve) => {
            resolver.current = resolve;
        });
    }, []);

    const close = (confirmed: boolean) => {
        resolver.current?.(confirmed);
        resolver.current = null;
        setOptions(null);
    };

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <Modal isOpen={options !== null} onClose={() => close(false)} title={options?.title ?? ''} description={options?.description} size="sm">
                <ModalFooter>
                    <Button variant="secondary" onClick={() => close(false)}>
                        {__(options?.cancelLabel ?? 'Cancel')}
                    </Button>
                    <Button variant={options?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => close(true)} autoFocus>
                        {__(options?.confirmLabel ?? 'Confirm')}
                    </Button>
                </ModalFooter>
            </Modal>
        </ConfirmContext.Provider>
    );
}

/**
 * Ask the user to confirm an action:
 *
 * ```tsx
 * const confirm = useConfirm();
 * if (await confirm({ title: 'Delete this user?', confirmLabel: 'Delete user', tone: 'danger' })) {
 *     router.delete(...);
 * }
 * ```
 *
 * Titles and labels are English texts; the dialog translates them.
 */
export function useConfirm(): ConfirmFunction {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error('useConfirm must be used inside <ConfirmProvider>.');
    }

    return context;
}

import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    children?: ReactNode;
}

const modalSizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
} as const;

/**
 * Centered dialog. Headless UI handles focus trapping, scroll locking and ESC.
 */
export function Modal({ isOpen, onClose, title, description, size = 'md', className, children }: ModalProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop transition className="bg-ink/30 fixed inset-0 transition-opacity duration-200 data-closed:opacity-0" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel
                    transition
                    className={cn(
                        'rounded-panel border-line bg-surface shadow-pop relative flex max-h-[calc(100dvh-2rem)] w-full flex-col border p-6 transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0',
                        modalSizes[size],
                        className,
                    )}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={__('Close')}
                        className="text-ink-muted hover:bg-surface-hover hover:text-ink rounded-field absolute top-4 right-4 inline-flex size-7 items-center justify-center transition-colors"
                    >
                        <X className="size-4" />
                    </button>
                    <DialogTitle className="text-ink pr-8 text-base font-semibold">{typeof title === 'string' ? __(title) : title}</DialogTitle>
                    {description && (
                        <Description className="text-ink-muted mt-1.5 text-sm">
                            {typeof description === 'string' ? __(description) : description}
                        </Description>
                    )}
                    {children && <div className="scrollbar-thin -mx-1 mt-5 min-h-0 overflow-y-auto px-1">{children}</div>}
                </DialogPanel>
            </div>
        </Dialog>
    );
}

export function ModalFooter({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />;
}

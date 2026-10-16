import { cn } from '@/lib/utils';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { type ReactNode } from 'react';

export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    /** Accessible title, visually hidden. */
    title: string;
    side?: 'left' | 'right';
    className?: string;
    children: ReactNode;
}

/**
 * Off-canvas panel. Headless UI handles focus trapping, scroll locking and ESC.
 */
export function Drawer({ isOpen, onClose, title, side = 'left', className, children }: DrawerProps) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <DialogBackdrop transition className="bg-ink/30 fixed inset-0 transition-opacity duration-200 data-closed:opacity-0" />
            <div className={cn('fixed inset-y-0 flex', side === 'left' ? 'left-0' : 'right-0')}>
                <DialogPanel
                    transition
                    className={cn(
                        'bg-surface shadow-pop flex h-full w-72 max-w-[85vw] flex-col transition-transform duration-200 ease-out',
                        side === 'left' ? 'data-closed:-translate-x-full' : 'data-closed:translate-x-full',
                        className,
                    )}
                >
                    <DialogTitle className="sr-only">{title}</DialogTitle>
                    {children}
                </DialogPanel>
            </div>
        </Dialog>
    );
}

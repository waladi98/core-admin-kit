import { cn } from '@/lib/utils';
import { Popover as HeadlessPopover, PopoverButton, PopoverPanel, type PopoverPanelProps } from '@headlessui/react';
import { type ComponentProps, type ReactElement, type ReactNode } from 'react';

/**
 * Floating panel for rich content (notification list, filters) that is not a plain menu.
 * For lists of actions use Dropdown instead. Headless UI handles focus, ESC and outside clicks.
 */
export function Popover({ className, ...props }: ComponentProps<'div'>) {
    return <HeadlessPopover as="div" className={cn('relative inline-flex', className)} {...props} />;
}

export function PopoverTrigger({ className, ...props }: ComponentProps<'button'>) {
    return <PopoverButton className={cn('outline-none', className)} {...props} />;
}

export interface PopoverContentProps {
    align?: 'start' | 'end';
    className?: string;
    children: ReactNode | ((bag: { close: () => void }) => ReactElement);
}

const anchors: Record<'start' | 'end', PopoverPanelProps['anchor']> = {
    start: 'bottom start',
    end: 'bottom end',
};

export function PopoverContent({ align = 'end', className, children }: PopoverContentProps) {
    return (
        <PopoverPanel
            anchor={anchors[align]}
            transition
            className={cn(
                'rounded-panel border-line bg-surface shadow-pop z-50 w-80 max-w-[calc(100vw-2rem)] border outline-none [--anchor-gap:8px]',
                'origin-top transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0',
                className,
            )}
        >
            {children}
        </PopoverPanel>
    );
}

import { useDisclosure } from '@/hooks/use-disclosure';
import { cn } from '@/lib/utils';
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from 'react';

interface CollapsibleContextValue {
    isOpen: boolean;
    toggle: () => void;
    contentId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(): CollapsibleContextValue {
    const context = useContext(CollapsibleContext);

    if (!context) {
        throw new Error('Collapsible components must be used inside <Collapsible>.');
    }

    return context;
}

export interface CollapsibleProps {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    className?: string;
    children: ReactNode;
}

export function Collapsible({ defaultOpen = false, open, onOpenChange, className, children }: CollapsibleProps) {
    const disclosure = useDisclosure(defaultOpen);
    const contentId = useId();

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : disclosure.isOpen;

    const toggle = () => {
        const nextState = !isOpen;

        if (!isControlled) {
            disclosure.setIsOpen(nextState);
        }

        onOpenChange?.(nextState);
    };

    return (
        <CollapsibleContext.Provider value={{ isOpen, toggle, contentId }}>
            <div data-state={isOpen ? 'open' : 'closed'} className={className}>
                {children}
            </div>
        </CollapsibleContext.Provider>
    );
}

export function CollapsibleTrigger({ className, onClick, ...props }: ComponentProps<'button'>) {
    const { isOpen, toggle, contentId } = useCollapsibleContext();

    return (
        <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={contentId}
            data-state={isOpen ? 'open' : 'closed'}
            className={cn('group/collapsible', className)}
            onClick={(event) => {
                onClick?.(event);
                toggle();
            }}
            {...props}
        />
    );
}

/**
 * Animates height using the CSS grid 0fr → 1fr technique, so no measuring is needed.
 */
export function CollapsibleContent({ className, children }: { className?: string; children: ReactNode }) {
    const { isOpen, contentId } = useCollapsibleContext();

    return (
        <div
            id={contentId}
            data-state={isOpen ? 'open' : 'closed'}
            className={cn('grid transition-[grid-template-rows] duration-200 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            inert={!isOpen}
        >
            <div className={cn('min-h-0 overflow-hidden', className)}>{children}</div>
        </div>
    );
}

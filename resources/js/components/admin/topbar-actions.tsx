import { createContext, useContext, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const TopbarSlotContext = createContext<{ slot: HTMLElement | null; setSlot: (element: HTMLElement | null) => void } | null>(null);

/**
 * Provided by AdminLayout. The Topbar registers its actions area here.
 */
export function TopbarSlotProvider({ children }: { children: ReactNode }) {
    const [slot, setSlot] = useState<HTMLElement | null>(null);

    return <TopbarSlotContext.Provider value={{ slot, setSlot }}>{children}</TopbarSlotContext.Provider>;
}

/**
 * Area in the Topbar where pages render their controls.
 */
export function TopbarActionsSlot({ className }: { className?: string }) {
    const context = useContext(TopbarSlotContext);

    return <div ref={context?.setSlot} className={className} />;
}

/**
 * Renders page-level controls (e.g. a period filter) in the topbar, while keeping
 * them inside the page component so they can use its state.
 *
 * ```tsx
 * <TopbarActions>
 *     <PeriodSelect value={period} onChange={setPeriod} options={options} />
 * </TopbarActions>
 * ```
 */
export function TopbarActions({ children }: { children: ReactNode }) {
    const context = useContext(TopbarSlotContext);

    if (!context?.slot) {
        return null;
    }

    return createPortal(children, context.slot);
}

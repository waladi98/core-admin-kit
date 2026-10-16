import { cn } from '@/lib/utils';
import { type ReactNode, useId, useState } from 'react';

export interface TooltipProps {
    content: ReactNode;
    side?: 'top' | 'bottom' | 'left' | 'right';
    disabled?: boolean;
    className?: string;
    children: ReactNode;
}

const sidePositions = {
    top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
    left: 'right-full top-1/2 mr-1.5 -translate-y-1/2',
    right: 'left-full top-1/2 ml-1.5 -translate-y-1/2',
} as const;

/**
 * Lightweight tooltip for short hints. It opens on hover and keyboard focus.
 */
export function Tooltip({ content, side = 'top', disabled = false, className, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = useId();

    const show = () => setIsVisible(true);
    const hide = () => setIsVisible(false);

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            {children}
            {!disabled && isVisible && (
                <span
                    id={tooltipId}
                    role="tooltip"
                    className={cn(
                        'bg-brand text-brand-foreground shadow-pop animate-in fade-in-0 zoom-in-95 pointer-events-none absolute z-50 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap',
                        sidePositions[side],
                        className,
                    )}
                >
                    {content}
                </span>
            )}
        </span>
    );
}

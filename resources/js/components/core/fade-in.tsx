import { cn } from '@/lib/utils';
import { type ComponentProps, type CSSProperties } from 'react';

export interface FadeInProps extends ComponentProps<'div'> {
    /** Delay before the animation starts, in milliseconds. */
    delay?: number;
    /** "rise" fades in while moving up slightly; "fade" only changes opacity. */
    variant?: 'rise' | 'fade';
}

/**
 * Animates its content in when it mounts, e.g. when deferred data arrives.
 */
export function FadeIn({ delay = 0, variant = 'rise', className, style, ...props }: FadeInProps) {
    return (
        <div
            className={cn(variant === 'rise' ? 'animate-enter' : 'animate-fade', className)}
            style={{ '--enter-delay': `${delay}ms`, ...style } as CSSProperties}
            {...props}
        />
    );
}

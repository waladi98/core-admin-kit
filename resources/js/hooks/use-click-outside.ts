import { type RefObject, useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(
    ref: RefObject<T | null>,
    handler: (event: MouseEvent | TouchEvent) => void,
    enabled = true,
): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const listener = (event: MouseEvent | TouchEvent) => {
            const element = ref.current;

            if (!element || element.contains(event.target as Node)) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler, enabled]);
}

import { useEffect } from 'react';

export function useEscapeKey(handler: (event: KeyboardEvent) => void, enabled = true): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handler(event);
            }
        };

        document.addEventListener('keydown', listener);

        return () => document.removeEventListener('keydown', listener);
    }, [handler, enabled]);
}

import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

/**
 * Returns true while an Inertia partial reload that requests any of the given
 * props is in flight. The flag only turns on after `delay` ms so fast responses
 * do not cause a flicker.
 */
export function useReloading(propNames: string[], delay = 200): boolean {
    const [isReloading, setIsReloading] = useState(false);
    const watchedProps = useRef(propNames);
    watchedProps.current = propNames;

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        let isTracking = false;

        const stop = () => {
            clearTimeout(timer);
            isTracking = false;
            setIsReloading(false);
        };

        const removeStartListener = router.on('start', (event) => {
            const { visit } = event.detail;

            // Inertia fires "start" for hover prefetches too; those are not reloads.
            if (visit.prefetch || !visit.only.some((prop) => watchedProps.current.includes(prop))) {
                return;
            }

            isTracking = true;
            clearTimeout(timer);
            timer = setTimeout(() => setIsReloading(true), delay);
        });

        const removeFinishListener = router.on('finish', (event) => {
            if (isTracking && !event.detail.visit.prefetch) {
                stop();
            }
        });

        return () => {
            clearTimeout(timer);
            removeStartListener();
            removeFinishListener();
        };
    }, [delay]);

    return isReloading;
}

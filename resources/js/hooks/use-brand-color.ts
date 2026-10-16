import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';

/**
 * Applies the brand color from Settings → Application by overriding the `--color-brand`
 * token on <html>, so every `bg-brand`/`text-brand` utility (including dialogs and toasts
 * rendered outside the layout) follows it. Called by the layouts.
 */
export function useBrandColor(): void {
    const color = usePage<SharedData>().props.branding?.color;

    useLayoutEffect(() => {
        if (color) {
            document.documentElement.style.setProperty('--color-brand', color);
        } else {
            document.documentElement.style.removeProperty('--color-brand');
        }
    }, [color]);
}

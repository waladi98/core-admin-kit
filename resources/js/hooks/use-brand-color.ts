import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';

/**
 * Applies the brand color from Settings → Application by overriding the `--brand-source`
 * variable on <html> (`--color-brand` derives from it, also in dark mode), so every `bg-brand`/`text-brand` utility (including dialogs and toasts
 * rendered outside the layout) follows it. Called by the layouts.
 */
export function useBrandColor(): void {
    const color = usePage<SharedData>().props.branding?.color;

    useLayoutEffect(() => {
        if (color) {
            document.documentElement.style.setProperty('--brand-source', color);
        } else {
            document.documentElement.style.removeProperty('--brand-source');
        }
    }, [color]);
}

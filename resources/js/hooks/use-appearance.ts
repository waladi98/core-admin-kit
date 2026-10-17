import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const storageKey = 'appearance';

function prefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function readAppearance(): Appearance {
    try {
        const stored = localStorage.getItem(storageKey);

        return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    } catch {
        return 'system';
    }
}

/** Sets or removes the `.dark` class on <html>. The inline script in app.blade.php does the same before the first paint. */
export function applyAppearance(appearance: Appearance): void {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
}

/**
 * Light / dark / system theme, remembered per browser (localStorage).
 * "System" follows the operating system setting, also when it changes later.
 */
export function useAppearance(): { appearance: Appearance; updateAppearance: (appearance: Appearance) => void } {
    const [appearance, setAppearance] = useState<Appearance>(readAppearance);

    // Changes of the operating system theme are followed by the listener in app.tsx.
    useEffect(() => applyAppearance(appearance), [appearance]);

    const updateAppearance = useCallback((next: Appearance) => {
        try {
            localStorage.setItem(storageKey, next);
        } catch {
            // Private mode or blocked storage: the choice only lasts for this page view.
        }
        setAppearance(next);
    }, []);

    return { appearance, updateAppearance };
}

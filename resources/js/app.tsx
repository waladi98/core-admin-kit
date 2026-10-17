import '../css/app.css';

import { applyAppearance, readAppearance } from '@/hooks/use-appearance';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;
}

// Keeps "Follow device" in sync when the operating system theme changes.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => applyAppearance(readAppearance()));

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    // Follows the brand token (light and dark); only shown when a visit takes longer than 250ms.
    progress: {
        color: 'var(--color-brand)',
        delay: 250,
        showSpinner: false,
    },
});

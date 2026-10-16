import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * Teach tailwind-merge the custom spacing tokens from app.css (h-control, p-page, gap-section, …)
 * so a later class such as `h-8` correctly overrides `h-control`.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            spacing: ['control', 'control-sm', 'row', 'row-head', 'topbar', 'page', 'section'],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

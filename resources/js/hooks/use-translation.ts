import { syncTranslations, translate, type TranslationReplacements } from '@/lib/i18n';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback } from 'react';

export interface UseTranslationResult {
    /** Translate an English text: `t('Add user')`, `t('Hello, :name', { name })`. */
    t: (key: string, replacements?: TranslationReplacements) => string;
    locale: string;
    /** Locale code → language name, e.g. `{ en: 'English', id: 'Bahasa Indonesia' }`. */
    locales: Record<string, string>;
}

export function useTranslation(): UseTranslationResult {
    const { locale, locales, translations } = usePage<SharedData>().props;

    const t = useCallback((key: string, replacements?: TranslationReplacements) => translate(translations ?? {}, key, replacements), [translations]);

    return { t, locale, locales };
}

/**
 * Keeps the module-level `__()` helper in sync with the current page.
 * Call once at the top of each layout, before its children render.
 */
export function useSyncTranslations(): void {
    const { locale, translations } = usePage<SharedData>().props;

    syncTranslations(locale, translations);
}

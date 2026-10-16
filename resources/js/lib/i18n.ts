/**
 * Frontend translations.
 *
 * Keys are the English texts (Laravel JSON translations, `lang/{locale}.json`),
 * so a missing translation simply shows the English text.
 * Placeholders use Laravel's `:name` syntax: `__('Hello, :name', { name })`.
 */

export type TranslationReplacements = Record<string, string | number>;

interface TranslationState {
    locale: string;
    translations: Record<string, string>;
}

const state: TranslationState = { locale: 'en', translations: {} };

/**
 * Called by the layouts while rendering, so every component below them
 * (and helper functions they call) uses the current page's language.
 */
export function syncTranslations(locale: string | undefined, translations: Record<string, string> | undefined): void {
    state.locale = locale ?? 'en';
    state.translations = translations ?? {};
}

export function translate(translations: Record<string, string>, key: string, replacements: TranslationReplacements = {}): string {
    const template = translations[key] ?? key;

    return Object.entries(replacements).reduce((text, [name, value]) => text.replaceAll(`:${name}`, String(value)), template);
}

/**
 * Translates outside React components (e.g. table column definitions rendered by a page).
 * Inside components prefer `useTranslation().t`.
 */
export function __(key: string, replacements?: TranslationReplacements): string {
    return translate(state.translations, key, replacements);
}

/**
 * BCP 47 tag for Intl formatters, e.g. "id" → "id-ID".
 */
export function intlLocale(locale: string = state.locale): string {
    const tags: Record<string, string> = { en: 'en-US', id: 'id-ID' };

    return tags[locale] ?? locale;
}

export function currentLocale(): string {
    return state.locale;
}

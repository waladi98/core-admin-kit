export interface Auth {
    user: User;
    /** Permission names of the signed-in user (admins get all), e.g. `users.create`. */
    permissions: string[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    /** One-time messages from the server, e.g. `->withToast('success', ...)`. */
    flash?: { toast?: { id: string; type: string; message: string } | null };
    /** Current interface language, e.g. `id`. */
    locale: string;
    /** Locale code → language name. */
    locales: Record<string, string>;
    /** English text → translated text for the current locale (empty for English). */
    translations: Record<string, string>;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    /** Preferred UI language; null follows the application default. */
    locale?: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

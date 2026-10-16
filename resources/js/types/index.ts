export interface Auth {
    user: User;
    /** Permission names of the signed-in user (admins get all), e.g. `users.create`. */
    permissions: string[];
}

/** An in-app notification (App\Notifications\AppNotification). Title and body are English keys. */
export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    params: Record<string, string | number>;
    url: string | null;
    tone: 'info' | 'success' | 'warning' | 'danger' | string;
    readAt: string | null;
    createdAt: string;
}

export interface SharedData {
    name: string;
    auth: Auth;
    /** Settings → Application (name, brand color, logo). Missing on the standalone error page. */
    branding?: { name: string; color: string; logoUrl: string | null };
    notifications?: { unreadCount: number };
    /** Only present after a partial reload that asks for it (when the bell opens). */
    notificationItems?: NotificationItem[];
    /** One-time messages from the server, e.g. `->withToast('success', ...)`. */
    flash?: { toast?: { id: string; type: string; message: string } | null };
    /** Current interface language, e.g. `id`. */
    locale: string;
    /** Locale code → language name. */
    locales: Record<string, string>;
    /** IANA timezone for displaying dates (APP_DISPLAY_TIMEZONE). */
    timezone: string;
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

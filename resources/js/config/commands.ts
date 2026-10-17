import { type LucideIcon, Building2, KeyRound, Lock, Palette, ShieldCheck, SunMoon, UserPlus, UserRound } from 'lucide-react';

export interface QuickAction {
    /** English text; translated in the palette. */
    title: string;
    href: string;
    icon: LucideIcon;
    /** Hidden unless the user has this permission. */
    permission?: string;
    /** Extra words that should find this action, in any language. */
    keywords?: string[];
}

/**
 * Actions offered by the command palette (⌘K / Ctrl+K) in addition to every menu page.
 * Add the "create" action of each new module here.
 */
export const quickActions: QuickAction[] = [
    { title: 'Add user', href: '/users/create', icon: UserPlus, permission: 'users.create', keywords: ['new', 'baru', 'tambah'] },
    // Opens the quick-add modal on the vendors list.
    {
        title: 'Add vendor',
        href: '/vendors?create=1',
        icon: Building2,
        permission: 'vendors.create',
        keywords: ['new', 'baru', 'tambah', 'supplier', 'pemasok'],
    },
    { title: 'Add role', href: '/roles/create', icon: Lock, permission: 'roles.manage', keywords: ['new', 'baru', 'tambah', 'permission', 'izin'] },
    { title: 'Profile settings', href: '/settings/profile', icon: UserRound, keywords: ['photo', 'foto', 'language', 'bahasa'] },
    { title: 'Password settings', href: '/settings/password', icon: KeyRound, keywords: ['security', 'keamanan'] },
    { title: 'Two-factor authentication', href: '/settings/two-factor', icon: ShieldCheck, keywords: ['2fa', 'otp', 'security', 'keamanan'] },
    { title: 'Appearance', href: '/settings/appearance', icon: SunMoon, keywords: ['theme', 'tema', 'dark', 'gelap', 'light', 'terang'] },
    {
        title: 'Application settings',
        href: '/settings/application',
        icon: Palette,
        permission: 'settings.manage',
        keywords: ['brand', 'logo', 'color', 'warna'],
    },
];

import { type LucideIcon } from 'lucide-react';

export interface AdminNavChild {
    title: string;
    /** Omit for placeholder menu entries that do not have a page yet. */
    href?: string;
    /** Hidden unless the user has this permission (e.g. `users.view`). */
    permission?: string;
}

export interface AdminNavItem {
    title: string;
    icon: LucideIcon;
    href?: string;
    /** Hidden unless the user has this permission (e.g. `users.view`). */
    permission?: string;
    children?: AdminNavChild[];
}

export interface AdminNavGroup {
    label: string;
    items: AdminNavItem[];
}

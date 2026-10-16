import { type LucideIcon } from 'lucide-react';

export interface AdminNavChild {
    title: string;
    /** Omit for placeholder menu entries that do not have a page yet. */
    href?: string;
}

export interface AdminNavItem {
    title: string;
    icon: LucideIcon;
    href?: string;
    children?: AdminNavChild[];
}

export interface AdminNavGroup {
    label: string;
    items: AdminNavItem[];
}

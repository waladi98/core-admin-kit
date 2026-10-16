import { type AdminNavGroup } from '@/types/navigation';
import { History, LayoutGrid, LockKeyhole, Settings, UserCog } from 'lucide-react';

/**
 * Sidebar menu.
 *
 * - Titles and group labels are English texts; the sidebar translates them (lang/id.json).
 * - `permission` hides an entry from users who lack it (see App\Enums\Permission).
 * - Entries without `href` are placeholders until their pages exist.
 * - A parent with `children` becomes a collapsible sub-menu (a flyout when the sidebar is collapsed):
 *
 *   {
 *       title: 'Transactions',
 *       icon: ArrowLeftRight,
 *       permission: 'transactions.view',
 *       children: [
 *           { title: 'All transactions', href: '/transactions' },
 *           { title: 'Approvals', href: '/transactions/approvals', permission: 'transactions.approve' },
 *       ],
 *   },
 */
export const mainNavigation: AdminNavGroup[] = [
    {
        label: 'Main Navigation',
        items: [{ title: 'Overview', icon: LayoutGrid, href: '/dashboard' }],
    },
    {
        label: 'Administration',
        items: [
            { title: 'Users', icon: UserCog, href: '/users', permission: 'users.view' },
            { title: 'Roles & Permissions', icon: LockKeyhole, href: '/roles', permission: 'roles.view' },
            { title: 'Activity log', icon: History, href: '/activity', permission: 'activity.view' },
        ],
    },
];

export const supportNavigation: AdminNavGroup[] = [
    {
        label: 'Support',
        items: [{ title: 'Settings', icon: Settings, href: '/settings/profile' }],
    },
];

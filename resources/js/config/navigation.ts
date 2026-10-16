import { type AdminNavGroup } from '@/types/navigation';
import {
    ArrowLeftRight,
    Blocks,
    BookOpen,
    Building2,
    FileText,
    LayoutGrid,
    LifeBuoy,
    LineChart,
    MessageSquare,
    PiggyBank,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';

/**
 * Finance Core sidebar menu.
 *
 * Entries without `href` are placeholders until their pages exist.
 */
export const mainNavigation: AdminNavGroup[] = [
    {
        label: 'Main Navigation',
        items: [
            { title: 'Overview', icon: LayoutGrid, href: '/dashboard' },
            {
                title: 'Transactions',
                icon: ArrowLeftRight,
                children: [{ title: 'All / My Queue' }, { title: 'Overdue Risk' }, { title: 'Escalations' }],
            },
            { title: 'Clients', icon: Building2 },
            { title: 'Users', icon: UserCog, href: '/users' },
            {
                title: 'Accounts & Teams',
                icon: Users,
                children: [{ title: 'Accounts' }, { title: 'Teams' }],
            },
            {
                title: 'Knowledge Base',
                icon: BookOpen,
                children: [{ title: 'Articles' }, { title: 'Policies' }],
            },
            { title: 'Integrations', icon: Blocks },
        ],
    },
    {
        label: 'Analytics & Insights',
        items: [
            { title: 'Compliance', icon: ShieldCheck },
            { title: 'Reports', icon: FileText },
            { title: 'Cashflow Analytics', icon: LineChart },
            { title: 'Budgeting', icon: PiggyBank },
        ],
    },
];

export const supportNavigation: AdminNavGroup[] = [
    {
        label: 'Support',
        items: [
            { title: 'Feedback', icon: MessageSquare },
            { title: 'Help & Support', icon: LifeBuoy },
            { title: 'Settings', icon: Settings, href: '/settings/profile' },
        ],
    },
];

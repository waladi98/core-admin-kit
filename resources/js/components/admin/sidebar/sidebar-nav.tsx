import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/core';
import { useNavigationPending } from '@/hooks/use-navigation-pending';
import { cn } from '@/lib/utils';
import { type AdminNavChild, type AdminNavGroup, type AdminNavItem } from '@/types/navigation';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, LoaderCircle } from 'lucide-react';
import { type ReactNode } from 'react';

interface SidebarNavProps {
    groups: AdminNavGroup[];
    isCollapsed: boolean;
    onNavigate?: () => void;
}

function isPathActive(currentUrl: string, href?: string): boolean {
    if (!href) {
        return false;
    }

    const currentPath = currentUrl.split('?')[0];

    return currentPath === href || currentPath.startsWith(`${href}/`);
}

const itemBaseClass =
    'flex h-9 w-full items-center gap-2.5 rounded-field px-2.5 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/20 [&_svg]:size-4 [&_svg]:shrink-0';

function itemStateClass(isActive: boolean): string {
    return isActive ? 'bg-surface text-ink font-medium shadow-panel ring-1 ring-line' : 'text-ink-soft hover:bg-surface-hover hover:text-ink';
}

interface NavTargetProps {
    href?: string;
    className: string;
    label?: string;
    onNavigate?: () => void;
    children: ReactNode;
}

/**
 * Renders an Inertia link, or an inert button for placeholder entries without a page.
 */
function NavTarget({ href, className, label, onNavigate, children }: NavTargetProps) {
    if (href) {
        return (
            <Link href={href} prefetch className={className} aria-label={label} title={label} onClick={onNavigate}>
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={cn(className, 'cursor-default')} aria-label={label} title={label}>
            {children}
        </button>
    );
}

function NavChildList({
    items,
    currentUrl,
    pendingPath,
    onNavigate,
}: {
    items: AdminNavChild[];
    currentUrl: string;
    pendingPath: string | null;
    onNavigate?: () => void;
}) {
    return (
        <ul className="border-line mt-1 ml-[17px] space-y-0.5 border-l pl-3">
            {items.map((child) => {
                const isActive = isPathActive(currentUrl, child.href);
                const isLoading = Boolean(child.href) && child.href === pendingPath;

                return (
                    <li key={child.title}>
                        <NavTarget
                            href={child.href}
                            onNavigate={onNavigate}
                            className={cn(
                                'flex h-8 w-full items-center rounded-md px-2 text-[13px] transition-colors',
                                isActive ? 'text-ink font-medium' : 'text-ink-muted hover:text-ink',
                            )}
                        >
                            <span className="flex-1 truncate">{child.title}</span>
                            {isLoading && <LoaderCircle className="text-ink-muted size-3.5 shrink-0 animate-spin" aria-label="Loading" />}
                        </NavTarget>
                    </li>
                );
            })}
        </ul>
    );
}

function NavEntry({
    item,
    isCollapsed,
    currentUrl,
    pendingPath,
    onNavigate,
}: {
    item: AdminNavItem;
    isCollapsed: boolean;
    currentUrl: string;
    pendingPath: string | null;
    onNavigate?: () => void;
}) {
    const isLoading = Boolean(item.href) && item.href === pendingPath;
    const Icon = isLoading ? LoaderCircle : item.icon;
    const iconClassName = isLoading ? 'text-ink-muted animate-spin' : undefined;
    const hasChildren = Boolean(item.children?.length);
    const isChildActive = item.children?.some((child) => isPathActive(currentUrl, child.href)) ?? false;
    const isActive = isPathActive(currentUrl, item.href) || isChildActive;

    if (isCollapsed) {
        return (
            <NavTarget
                href={item.href ?? item.children?.[0]?.href}
                label={item.title}
                onNavigate={onNavigate}
                className={cn(itemBaseClass, 'justify-center px-0', itemStateClass(isActive))}
            >
                <Icon className={iconClassName} />
            </NavTarget>
        );
    }

    if (!hasChildren) {
        return (
            <NavTarget href={item.href} onNavigate={onNavigate} className={cn(itemBaseClass, itemStateClass(isActive))}>
                <Icon className={iconClassName} />
                <span className="truncate">{item.title}</span>
            </NavTarget>
        );
    }

    return (
        <Collapsible defaultOpen={isChildActive}>
            <CollapsibleTrigger className={cn(itemBaseClass, itemStateClass(false), isChildActive && 'text-ink font-medium')}>
                <Icon />
                <span className="flex-1 truncate text-left">{item.title}</span>
                <ChevronDown className="text-ink-subtle transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <NavChildList items={item.children ?? []} currentUrl={currentUrl} pendingPath={pendingPath} onNavigate={onNavigate} />
            </CollapsibleContent>
        </Collapsible>
    );
}

export function SidebarNav({ groups, isCollapsed, onNavigate }: SidebarNavProps) {
    const { url } = usePage();
    const { isPending, pendingPath } = useNavigationPending();
    const visiblePendingPath = isPending ? pendingPath : null;

    return (
        <nav className="space-y-5">
            {groups.map((group) => (
                <div key={group.label}>
                    {isCollapsed ? (
                        <div className="bg-line mx-auto mb-2 h-px w-6" aria-hidden="true" />
                    ) : (
                        <p className="text-ink-subtle mb-1.5 px-2.5 text-[11px] font-medium tracking-wide uppercase">{group.label}</p>
                    )}
                    <ul className="space-y-0.5">
                        {group.items.map((item) => (
                            <li key={item.title}>
                                <NavEntry
                                    item={item}
                                    isCollapsed={isCollapsed}
                                    currentUrl={url}
                                    pendingPath={visiblePendingPath}
                                    onNavigate={onNavigate}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );
}

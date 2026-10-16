import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownTrigger,
} from '@/components/core';
import { useNavigationPending } from '@/hooks/use-navigation-pending';
import { cn } from '@/lib/utils';
import { type AdminNavChild, type AdminNavGroup, type AdminNavItem } from '@/types/navigation';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight, LoaderCircle } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

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
    isActive?: boolean;
    onNavigate?: () => void;
    children: ReactNode;
}

/**
 * Renders an Inertia link, or an inert button for placeholder entries without a page.
 */
function NavTarget({ href, className, label, isActive = false, onNavigate, children }: NavTargetProps) {
    if (href) {
        return (
            <Link
                href={href}
                prefetch
                className={className}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                title={label}
                onClick={onNavigate}
            >
                {children}
            </Link>
        );
    }

    return (
        <button type="button" className={cn('cursor-default text-left', className)} aria-label={label} title={label}>
            {children}
        </button>
    );
}

/**
 * Sub-menu drawn on a thin vertical rail. The active entry thickens its part
 * of the rail in the brand color; hovering an entry hints its segment.
 */
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
        <ul className="before:bg-line relative mt-0.5 mb-1 ml-[18px] space-y-px pl-3 before:absolute before:inset-y-1 before:left-0 before:w-px">
            {items.map((child) => {
                const isActive = isPathActive(currentUrl, child.href);
                const isLoading = Boolean(child.href) && child.href === pendingPath;

                return (
                    <li key={child.title} className="group/child relative">
                        <span
                            aria-hidden="true"
                            className={cn(
                                'absolute top-1.5 bottom-1.5 -left-3 w-0.5 -translate-x-1/4 rounded-full transition-colors duration-200',
                                isActive ? 'bg-brand' : 'group-hover/child:bg-line-strong bg-transparent',
                            )}
                        />
                        <NavTarget
                            href={child.href}
                            isActive={isActive}
                            onNavigate={onNavigate}
                            className={cn(
                                'rounded-field flex h-8 w-full items-center gap-2 px-2.5 text-[13px] transition-colors',
                                isActive
                                    ? 'bg-surface text-ink ring-line font-medium ring-1'
                                    : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
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

/**
 * Collapsed sidebar: a parent with children opens its sub-menu in a flyout beside the icon.
 */
function CollapsedFlyout({ item, isActive, onNavigate }: { item: AdminNavItem; isActive: boolean; onNavigate?: () => void }) {
    const Icon = item.icon;

    return (
        <Dropdown className="w-full">
            <DropdownTrigger
                aria-label={item.title}
                title={item.title}
                className={cn(itemBaseClass, 'justify-center px-0', itemStateClass(isActive))}
            >
                <Icon />
            </DropdownTrigger>
            <DropdownContent side="right" align="start" className="min-w-48">
                <DropdownLabel className="text-ink font-semibold">{item.title}</DropdownLabel>
                {(item.children ?? []).map((child) => (
                    <DropdownItem key={child.title} href={child.href} onSelect={onNavigate} disabled={!child.href}>
                        {child.title}
                    </DropdownItem>
                ))}
            </DropdownContent>
        </Dropdown>
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

    if (isCollapsed && hasChildren) {
        return <CollapsedFlyout item={item} isActive={isActive} onNavigate={onNavigate} />;
    }

    if (isCollapsed) {
        return (
            <NavTarget
                href={item.href}
                label={item.title}
                isActive={isActive}
                onNavigate={onNavigate}
                className={cn(itemBaseClass, 'justify-center px-0', itemStateClass(isActive))}
            >
                <Icon className={iconClassName} />
            </NavTarget>
        );
    }

    if (!hasChildren) {
        return (
            <NavTarget href={item.href} isActive={isActive} onNavigate={onNavigate} className={cn(itemBaseClass, itemStateClass(isActive))}>
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
                {isChildActive && (
                    <span aria-hidden="true" className="bg-brand hidden size-1.5 shrink-0 rounded-full group-data-[state=closed]/collapsible:block" />
                )}
                <ChevronRight className="text-ink-subtle size-3.5! transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
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
    const navRef = useRef<HTMLElement>(null);

    // Bring the active entry into view when the sidebar first renders (e.g. a deep link to a lower menu).
    useEffect(() => {
        navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
    }, []);

    return (
        <nav ref={navRef} className="space-y-5">
            {groups.map((group) => (
                <div key={group.label}>
                    {isCollapsed ? (
                        <div className="bg-line mx-auto mb-2 h-px w-6" aria-hidden="true" />
                    ) : (
                        <p className="text-ink-subtle mb-1.5 px-2.5 text-xs font-medium tracking-wide uppercase">{group.label}</p>
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

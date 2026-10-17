import { filterNavigation } from '@/components/admin/sidebar/sidebar-nav';
import { Kbd } from '@/components/core';
import { quickActions } from '@/config/commands';
import { mainNavigation, supportNavigation } from '@/config/navigation';
import { usePermissions } from '@/hooks/use-can';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { CornerDownLeft, FileText, Search, type LucideIcon } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

interface CommandItem {
    id: string;
    title: string;
    group: string;
    href: string;
    icon: LucideIcon;
    searchText: string;
}

const CommandPaletteContext = createContext<{ open: () => void } | null>(null);

/**
 * Pages from the sidebar menu plus quick actions, filtered by permission and translated.
 */
function useCommandItems(): CommandItem[] {
    const can = usePermissions();

    return useMemo(() => {
        const pages = filterNavigation([...mainNavigation, ...supportNavigation], can).flatMap((group) =>
            group.items.flatMap((item) => {
                const entries = item.href ? [{ title: item.title, href: item.href, icon: item.icon }] : [];
                const children = (item.children ?? [])
                    .filter((child) => child.href)
                    .map((child) => ({ title: `${__(item.title)} › ${__(child.title)}`, href: child.href as string, icon: item.icon }));

                return [...entries, ...children];
            }),
        );

        const actions = quickActions.filter((action) => !action.permission || can(action.permission));

        return [
            ...actions.map((action) => ({
                id: `action:${action.href}`,
                title: __(action.title),
                group: __('Quick actions'),
                href: action.href,
                icon: action.icon,
                searchText: [action.title, __(action.title), ...(action.keywords ?? [])].join(' ').toLowerCase(),
            })),
            ...pages.map((page) => ({
                id: `page:${page.href}`,
                title: __(page.title),
                group: __('Pages'),
                href: page.href,
                icon: page.icon ?? FileText,
                searchText: `${page.title} ${__(page.title)} ${page.href}`.toLowerCase(),
            })),
        ];
    }, [can]);
}

/**
 * ⌘K / Ctrl+K search across pages and quick actions. Provided by AdminLayout;
 * open it from anywhere with `useCommandPalette().open()`.
 */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const items = useCommandItems();
    const open = useCallback(() => setIsOpen(true), []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsOpen((current) => !current);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const close = () => {
        setIsOpen(false);
        setQuery('');
    };

    const keyword = query.trim().toLowerCase();
    const results = keyword ? items.filter((item) => keyword.split(/\s+/).every((word) => item.searchText.includes(word))) : items;
    const groups = [...new Set(results.map((item) => item.group))];

    const select = (item: CommandItem | null) => {
        if (!item) {
            return;
        }

        close();
        router.visit(item.href);
    };

    return (
        <CommandPaletteContext.Provider value={{ open }}>
            {children}

            <Dialog open={isOpen} onClose={close} className="relative z-50">
                <DialogBackdrop transition className="bg-overlay fixed inset-0 transition-opacity duration-150 data-closed:opacity-0" />
                <div className="fixed inset-0 flex items-start justify-center p-4 pt-[12vh]">
                    <DialogPanel
                        transition
                        className="rounded-panel border-line bg-surface shadow-pop w-full max-w-xl overflow-hidden border transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
                    >
                        <DialogTitle className="sr-only">{__('Search anything')}</DialogTitle>
                        <Combobox onChange={select} immediate>
                            <div className="border-line flex items-center gap-2 border-b px-4">
                                <Search className="text-ink-subtle size-4 shrink-0" aria-hidden="true" />
                                <ComboboxInput
                                    autoFocus
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder={__('Search pages and actions…')}
                                    className="text-ink placeholder:text-ink-subtle h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
                                />
                                <Kbd>Esc</Kbd>
                            </div>

                            <ComboboxOptions static className="scrollbar-thin max-h-80 overflow-y-auto p-2">
                                {results.length === 0 ? (
                                    <p className="text-ink-muted px-3 py-8 text-center text-sm">{__('No results')}</p>
                                ) : (
                                    groups.map((group) => (
                                        <div key={group} className="mb-1 last:mb-0">
                                            <p className="text-ink-subtle px-3 pt-2 pb-1 text-xs font-medium tracking-wide uppercase">{group}</p>
                                            {results
                                                .filter((item) => item.group === group)
                                                .map((item) => {
                                                    const Icon = item.icon;

                                                    return (
                                                        <ComboboxOption
                                                            key={item.id}
                                                            value={item}
                                                            className={cn(
                                                                'group data-focus:bg-surface-hover rounded-field flex cursor-pointer items-center gap-3 px-3 py-2 text-sm',
                                                            )}
                                                        >
                                                            <Icon className="text-ink-muted size-4 shrink-0" aria-hidden="true" />
                                                            <span className="text-ink-soft group-data-focus:text-ink min-w-0 flex-1 truncate">
                                                                {item.title}
                                                            </span>
                                                            <CornerDownLeft
                                                                className="text-ink-subtle size-3.5 opacity-0 group-data-focus:opacity-100"
                                                                aria-hidden="true"
                                                            />
                                                        </ComboboxOption>
                                                    );
                                                })}
                                        </div>
                                    ))
                                )}
                            </ComboboxOptions>
                        </Combobox>
                    </DialogPanel>
                </div>
            </Dialog>
        </CommandPaletteContext.Provider>
    );
}

export function useCommandPalette(): { open: () => void } {
    const context = useContext(CommandPaletteContext);

    if (!context) {
        throw new Error('useCommandPalette must be used inside <CommandPaletteProvider>.');
    }

    return context;
}

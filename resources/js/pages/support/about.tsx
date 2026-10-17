import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { ModuleGeneratorGuide, type ModuleGeneratorInfo } from '@/components/admin/module-generator-guide';
import { Badge, Input, Panel, SegmentedControl, useToast, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { __ } from '@/lib/i18n';
import { Link } from '@inertiajs/react';
import { Info, icons as lucideIcons, Package, Palette, Search, Shapes, SquareArrowOutUpRight, Wand2 } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

interface TemplatePackage {
    name: string;
    version: string | null;
    area: string;
    purpose: string;
    docs: string;
}

interface AboutProps {
    packages: TemplatePackage[];
    icons: string[];
    generator: ModuleGeneratorInfo;
}

type AboutTab = 'icons' | 'styling' | 'packages' | 'generator';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Support', href: '/support/about' },
    { title: 'About template', href: '/support/about' },
];

const tabOptions: { value: AboutTab; label: string }[] = [
    { value: 'icons', label: 'Icons' },
    { value: 'styling', label: 'Styling' },
    { value: 'packages', label: 'Packages' },
    { value: 'generator', label: 'Generator' },
];

const colorTokens = [
    'surface',
    'surface-muted',
    'surface-hover',
    'line',
    'line-strong',
    'ink',
    'ink-soft',
    'ink-muted',
    'ink-subtle',
    'brand',
    'brand-foreground',
    'success',
    'success-soft',
    'danger',
    'danger-soft',
    'warning',
    'warning-soft',
    'info',
    'info-soft',
];

const sizeTokens: { token: string; utility: string; use: string }[] = [
    { token: '--spacing-control', utility: 'h-control', use: 'Input, select and button height' },
    { token: '--spacing-control-sm', utility: 'h-control-sm', use: 'Small controls in toolbars and tables' },
    { token: '--spacing-row', utility: 'h-row', use: 'Table body row' },
    { token: '--spacing-row-head', utility: 'h-row-head', use: 'Table header row' },
    { token: '--spacing-topbar', utility: 'h-topbar', use: 'Topbar height' },
    { token: '--spacing-page', utility: 'p-page', use: 'Padding around page content' },
    { token: '--spacing-section', utility: 'gap-section', use: 'Gap between panels' },
    { token: '--radius-panel', utility: 'rounded-panel', use: 'Panel corners' },
    { token: '--radius-field', utility: 'rounded-field', use: 'Input and menu corners' },
];

/** Reads the current value of CSS variables on <html> (follows the active light/dark theme). */
function useCssVariables(names: string[]): Record<string, string> {
    const [values, setValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const read = () => {
            const style = getComputedStyle(document.documentElement);
            setValues(Object.fromEntries(names.map((name) => [name, style.getPropertyValue(name).trim()])));
        };
        read();

        // Re-read when the theme class on <html> changes.
        const observer = new MutationObserver(read);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });

        return () => observer.disconnect();
    }, [names]);

    return values;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-2">
            <h3 className="text-ink text-sm font-semibold">{__(title)}</h3>
            {children}
        </section>
    );
}

function IconsTab({ icons }: { icons: string[] }) {
    const toast = useToast();
    const [search, setSearch] = useState('');
    const visibleIcons = icons.filter((name) => name.toLowerCase().includes(search.trim().toLowerCase()));

    const copyName = (name: string) => {
        void navigator.clipboard?.writeText(name);
        toast.success(__(':name copied.', { name }));
    };

    return (
        <div className="space-y-4">
            <p className="text-ink-soft text-sm">
                {__('Icons come from Lucide (lucide-react). Import them by name; they take the text color and size-4 by default.')}{' '}
                <a
                    href="https://lucide.dev/icons"
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink inline-flex items-center gap-1 underline underline-offset-4"
                >
                    lucide.dev <SquareArrowOutUpRight className="size-3.5" />
                </a>
            </p>
            <pre className="rounded-field bg-surface-muted text-ink overflow-x-auto p-3 font-mono text-[13px]">
                {"import { UserPlus } from 'lucide-react';\n\n<Button><UserPlus /> {t('Add user')}</Button>"}
            </pre>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-ink-muted text-sm">{__(':count icons used in this app. Click one to copy its name.', { count: icons.length })}</p>
                <div className="relative w-full sm:w-64">
                    <Search className="text-ink-subtle pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={__('Search icons')}
                        aria-label={__('Search icons')}
                        className="h-control-sm pl-8"
                    />
                </div>
            </div>

            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
                {visibleIcons.map((name) => {
                    const Icon = lucideIcons[name as keyof typeof lucideIcons];

                    return (
                        <li key={name}>
                            <button
                                type="button"
                                onClick={() => copyName(name)}
                                className="rounded-field border-line hover:bg-surface-hover focus-visible:ring-brand/20 flex w-full flex-col items-center gap-2 border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                            >
                                {Icon ? <Icon className="text-ink size-5" /> : <Shapes className="text-ink-subtle size-5" />}
                                <span className="text-ink-soft w-full truncate text-center text-xs">{name}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
            {visibleIcons.length === 0 && <p className="text-ink-muted text-sm">{__('No icons found')}</p>}
        </div>
    );
}

function StylingTab() {
    const cssNames = useMemo(() => [...colorTokens.map((token) => `--color-${token}`), ...sizeTokens.map((size) => size.token)], []);
    const values = useCssVariables(cssNames);

    return (
        <div className="space-y-6">
            <p className="text-ink-soft text-sm">
                {__(
                    'Styling uses Tailwind CSS v4. All design tokens live in resources/css/app.css (@theme, dark values under .dark). Use the token utilities, never raw palette colors.',
                )}{' '}
                <a
                    href="https://tailwindcss.com/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink inline-flex items-center gap-1 underline underline-offset-4"
                >
                    tailwindcss.com <SquareArrowOutUpRight className="size-3.5" />
                </a>
            </p>

            <Section title="Color tokens (current theme)">
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {colorTokens.map((token) => (
                        <li key={token} className="rounded-field border-line flex items-center gap-3 border p-2">
                            <span className="border-line size-8 shrink-0 rounded-md border" style={{ background: `var(--color-${token})` }} />
                            <span className="min-w-0">
                                <code className="text-ink block truncate font-mono text-xs">{token}</code>
                                <span className="text-ink-muted block truncate font-mono text-xs">{values[`--color-${token}`] || '—'}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section title="Density, radius and font">
                <div className="rounded-field border-line overflow-x-auto border">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-muted text-ink-muted text-xs">
                            <tr>
                                <th className="px-3 py-2 font-medium">{__('Utility')}</th>
                                <th className="px-3 py-2 font-medium">{__('Value')}</th>
                                <th className="px-3 py-2 font-medium">{__('Used for')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-line divide-y">
                            {sizeTokens.map((size) => (
                                <tr key={size.token}>
                                    <td className="text-ink px-3 py-2 font-mono text-xs">{size.utility}</td>
                                    <td className="text-ink-soft px-3 py-2 font-mono text-xs">{values[size.token] || '—'}</td>
                                    <td className="text-ink-soft px-3 py-2">{__(size.use)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="text-ink px-3 py-2 font-mono text-xs">font-sans</td>
                                <td className="text-ink-soft px-3 py-2 font-mono text-xs">Instrument Sans</td>
                                <td className="text-ink-soft px-3 py-2">{__('All text (loaded from fonts.bunny.net)')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section title="More">
                <ul className="text-ink-soft list-disc space-y-1 pl-5 text-sm">
                    <li>
                        {__('Every core component with its variants:')}{' '}
                        <Link href="/ui" className="text-ink underline underline-offset-4">
                            /ui
                        </Link>{' '}
                        <span className="text-ink-muted">({__('local environment only')})</span>
                    </li>
                    <li>{__('Rules for pages and modules: AGENTS.md and .docs/guide-new-module.md in the project.')}</li>
                </ul>
            </Section>
        </div>
    );
}

function PackagesTab({ packages }: { packages: TemplatePackage[] }) {
    const columns: DataTableColumn<TemplatePackage>[] = [
        { key: 'name', header: 'Package', cell: (row) => <code className="text-ink font-mono text-[13px]">{row.name}</code> },
        { key: 'version', header: 'Version', cell: (row) => <span className="text-ink-soft font-mono text-[13px]">{row.version ?? '—'}</span> },
        { key: 'area', header: 'Area', cell: (row) => <Badge shape="pill">{__(row.area)}</Badge>, skeleton: 'badge' },
        { key: 'purpose', header: 'Used for', cell: (row) => <span className="text-ink-soft">{__(row.purpose)}</span> },
        {
            key: 'docs',
            header: 'Documentation',
            cell: (row) => (
                <a href={row.docs} target="_blank" rel="noreferrer" className="text-ink inline-flex items-center gap-1 underline underline-offset-4">
                    {new URL(row.docs).hostname.replace(/^www\./, '')} <SquareArrowOutUpRight className="size-3.5" />
                </a>
            ),
        },
    ];

    return <DataTable stickyHeader rows={packages} columns={columns} getRowId={(row) => row.name} />;
}

export default function About({ packages, icons, generator }: AboutProps) {
    const [tab, setTab] = useState<AboutTab>('icons');
    const tabIcon = { icons: Shapes, styling: Palette, packages: Package, generator: Wand2 }[tab];

    return (
        <Panel fill>
            <Panel.Header
                title="About template"
                icon={tabIcon ?? Info}
                actions={
                    <SegmentedControl
                        label={__('Section')}
                        options={tabOptions.map((option) => ({ ...option, label: __(option.label) }))}
                        value={tab}
                        onChange={setTab}
                    />
                }
            />
            <Panel.Body padding={tab === 'packages' ? 'none' : undefined} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
                {tab === 'icons' && <IconsTab icons={icons} />}
                {tab === 'styling' && <StylingTab />}
                {tab === 'packages' && <PackagesTab packages={packages} />}
                {tab === 'generator' && <ModuleGeneratorGuide generator={generator} />}
            </Panel.Body>
        </Panel>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
About.layout = (page: ReactNode) => <AdminLayout breadcrumbs={breadcrumbs}>{page}</AdminLayout>;

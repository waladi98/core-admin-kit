import { Badge, IconButton, useToast } from '@/components/core';
import { __ } from '@/lib/i18n';
import { Copy } from 'lucide-react';
import { type ReactNode } from 'react';

export interface ModuleGeneratorInfo {
    /** Field types of `make:module` (App\Support\ModuleGenerator\ModuleField::TYPES). */
    types: { name: string; column: string; input: string; description: string }[];
    /** Form patterns (App\Support\ModuleGenerator\ModuleBlueprint::PATTERNS). */
    patterns: { name: string; description: string }[];
}

const exampleCommand =
    'php artisan make:module Client --pattern=mixed \\\n  --fields="name:string, email:email?, kind:select(retail,corporate), credit_limit:currency, notes:text?" \\\n  --group="Master Data" --icon=Briefcase';

const options: { option: string; description: string }[] = [
    { option: 'name', description: 'Singular module name, e.g. Client or ProductCategory. URL, table and permissions are derived from it.' },
    { option: '--pattern', description: 'page or mixed (see the patterns above). Default in the questions: mixed.' },
    { option: '--fields', description: 'Comma-separated name:type list. Add ? after the type for an optional field.' },
    { option: '--group', description: 'Sidebar menu group. A new group is created above Administration when it does not exist.' },
    { option: '--icon', description: 'Lucide icon name for the menu (see the Icons tab).' },
    { option: '--dry-run', description: 'Only list the files that would be created or changed.' },
    { option: '--no-format', description: 'Skip Pint and Prettier on the generated files.' },
];

const nextSteps = [
    'php artisan migrate',
    'php artisan app:sync-permissions',
    'Tick the new permissions for other roles on Roles & Permissions (only admins have them at first).',
    'Translate the new texts in lang/id.json (added with the English text as a placeholder).',
    'composer test:local (runs the generated feature test too)',
    'Adjust the generated code to the business rules: it is ordinary code, not a black box.',
];

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="space-y-2">
            <h3 className="text-ink text-sm font-semibold">{__(title)}</h3>
            {children}
        </section>
    );
}

function CodeBlock({ code }: { code: string }) {
    const toast = useToast();

    return (
        <div className="rounded-field bg-surface-muted relative">
            <pre className="text-ink overflow-x-auto p-3 pr-12 font-mono text-[13px]">{code}</pre>
            <IconButton
                label={__('Copy')}
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                    void navigator.clipboard?.writeText(code.replace(/\\\n\s*/g, ''));
                    toast.success(__('Command copied.'));
                }}
            >
                <Copy />
            </IconButton>
        </div>
    );
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
    return (
        <div className="rounded-field border-line overflow-x-auto border">
            <table className="w-full text-left text-sm">
                <thead className="bg-surface-muted text-ink-muted text-xs">
                    <tr>
                        {head.map((title) => (
                            <th key={title} className="px-3 py-2 font-medium whitespace-nowrap">
                                {__(title)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-line divide-y">
                    {rows.map((cells, index) => (
                        <tr key={index}>
                            {cells.map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-ink-soft px-3 py-2 align-top">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * How to use `php artisan make:module` (Support → About template → Generator).
 */
export function ModuleGeneratorGuide({ generator }: { generator: ModuleGeneratorInfo }) {
    return (
        <div className="space-y-6">
            <p className="text-ink-soft text-sm">
                {__(
                    'One command creates a complete CRUD module that follows the Users and Vendors modules: migration, model with audit trail, factory, seeder, permissions, policy, controller, form requests, routes, pages, menu entry, command palette action, translations and a feature test.',
                )}
            </p>

            <Section title="Example">
                <CodeBlock code={exampleCommand} />
                <p className="text-ink-muted text-xs">{__('Run php artisan make:module without options to answer the questions one by one.')}</p>
            </Section>

            <Section title="Patterns">
                <div className="grid gap-2 md:grid-cols-2">
                    {generator.patterns.map((pattern) => (
                        <div key={pattern.name} className="rounded-field border-line border p-3">
                            <code className="text-ink font-mono text-sm font-semibold">{pattern.name}</code>
                            <p className="text-ink-soft mt-1 text-sm">{__(pattern.description)}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Options">
                <SimpleTable
                    head={['Option', 'Description']}
                    rows={options.map((item) => [
                        <code className="text-ink font-mono text-xs whitespace-nowrap">{item.option}</code>,
                        __(item.description),
                    ])}
                />
            </Section>

            <Section title="Field types">
                <SimpleTable
                    head={['Type', 'Database column', 'Form input', 'Description']}
                    rows={generator.types.map((type) => [
                        <code className="text-ink font-mono text-xs">{type.name}</code>,
                        <span className="font-mono text-xs">{type.column}</span>,
                        <Badge shape="pill">{type.input}</Badge>,
                        __(type.description),
                    ])}
                />
                <p className="text-ink-muted text-xs">
                    {__(
                        'Every module also gets an active/inactive status with filter tabs. The first string field is the record title and must be required.',
                    )}
                </p>
            </Section>

            <Section title="After generating">
                <ol className="text-ink-soft list-decimal space-y-1 pl-5 text-sm">
                    {nextSteps.map((step) => (
                        <li key={step}>
                            {step.startsWith('php ') || step.startsWith('composer ') ? (
                                <code className="text-ink font-mono text-xs">{step}</code>
                            ) : (
                                __(step)
                            )}
                        </li>
                    ))}
                </ol>
            </Section>

            <Section title="Good to know">
                <ul className="text-ink-soft list-disc space-y-1 pl-5 text-sm">
                    <li>{__('Templates live in stubs/module/*.stub; change them to change every future module.')}</li>
                    <li>{__('Shared files are only changed at the // @module-generator:* comments; keep those comments.')}</li>
                    <li>{__('Routes of each module are in routes/modules/{name}.php and load automatically.')}</li>
                    <li>
                        {__(
                            'To remove a generated module, delete the files it listed and its lines in Permission.php, navigation.ts and commands.ts.',
                        )}
                    </li>
                    <li>{__('Relations between modules (e.g. picking a client) are not generated yet; add them by hand.')}</li>
                </ul>
            </Section>
        </div>
    );
}

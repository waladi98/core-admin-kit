import { TrendBadge } from '@/components/admin/trend-badge';
import {
    Avatar,
    Badge,
    Button,
    Checkbox,
    CheckboxGroup,
    Combobox,
    CurrencyInput,
    DatePicker,
    Dropdown,
    DropdownContent,
    DropdownItem,
    DropdownLabel,
    DropdownSeparator,
    DropdownTrigger,
    FileUpload,
    FilterTabs,
    FormActions,
    FormField,
    FormSection,
    Grid,
    IconButton,
    Input,
    Kbd,
    Pagination,
    Panel,
    RadioGroup,
    SegmentedControl,
    Select,
    Skeleton,
    SkeletonText,
    Switch,
    Textarea,
    Tooltip,
    buttonVariants,
    useConfirm,
    useToast,
    type BreadcrumbEntry,
} from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { formatCompact, formatCurrency, formatDate, formatDateTime, formatNumber, formatPercent, formatRelative } from '@/lib/format';
import { Head } from '@inertiajs/react';
import { Bell, Blocks, MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [{ title: 'Component catalog', href: '/ui', icon: Blocks }];

const options = [
    { value: 'jakarta', label: 'Jakarta', description: 'DKI Jakarta' },
    { value: 'bandung', label: 'Bandung', description: 'Jawa Barat' },
    { value: 'surabaya', label: 'Surabaya', description: 'Jawa Timur' },
    { value: 'medan', label: 'Medan', description: 'Sumatera Utara' },
];

/** One labelled example on the catalog. */
function Example({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <p className="text-ink-muted text-xs font-medium tracking-wide uppercase">{title}</p>
            <div className="flex flex-wrap items-center gap-2">{children}</div>
        </div>
    );
}

/**
 * Developer catalog of the Finance Core design system (local environment only, /ui).
 * Import everything from `@/components/core`; see AGENTS.md for the rules.
 */
export default function ComponentCatalog() {
    const toast = useToast();
    const confirm = useConfirm();
    const [tab, setTab] = useState('all');
    const [segment, setSegment] = useState('today');
    const [city, setCity] = useState<string | null>('bandung');
    const [radio, setRadio] = useState('monthly');
    const [checks, setChecks] = useState<string[]>(['email']);
    const [isOn, setIsOn] = useState(true);
    const [isChecked, setIsChecked] = useState(true);
    const [date, setDate] = useState('2026-10-17');
    const [amount, setAmount] = useState<number | null>(1250000);
    const [file, setFile] = useState<File | null>(null);
    const [page, setPage] = useState(2);

    return (
        <>
            <Head title="Component catalog" />

            <Grid>
                <Grid.Item span={{ base: 12, xl: 6 }}>
                    <Panel>
                        <Panel.Header title="Buttons & badges" />
                        <Panel.Body className="space-y-4">
                            <Example title="Button variants">
                                <Button>Primary</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="danger">Danger</Button>
                                <Button variant="link">Link</Button>
                                <Button isLoading>Saving</Button>
                            </Example>
                            <Example title="Sizes & icons">
                                <Button size="sm">
                                    <Plus /> Small
                                </Button>
                                <Button size="lg">Large</Button>
                                <IconButton label="Notifications" variant="secondary">
                                    <Bell />
                                </IconButton>
                                <Tooltip content="Tooltip text">
                                    <Button variant="secondary" size="sm">
                                        Hover me
                                    </Button>
                                </Tooltip>
                                <Kbd>⌘K</Kbd>
                            </Example>
                            <Example title="Badges">
                                <Badge>Neutral</Badge>
                                <Badge tone="success">Success</Badge>
                                <Badge tone="danger">Danger</Badge>
                                <Badge tone="warning">Warning</Badge>
                                <Badge tone="info" shape="pill">
                                    Pill
                                </Badge>
                                <TrendBadge change={7.1} />
                                <TrendBadge change={-1.3} />
                            </Example>
                            <Example title="Avatars">
                                <Avatar name="Rina Wati" size="sm" />
                                <Avatar name="Budi Santoso" isOnline />
                                <Avatar name="Sari Dewi" size="lg" isOnline={false} />
                            </Example>
                        </Panel.Body>
                    </Panel>
                </Grid.Item>

                <Grid.Item span={{ base: 12, xl: 6 }}>
                    <Panel>
                        <Panel.Header title="Feedback & navigation" />
                        <Panel.Body className="space-y-4">
                            <Example title="Toasts">
                                <Button variant="secondary" size="sm" onClick={() => toast.success('User created.')}>
                                    Success
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => toast.error('Move the users to another role before deleting this one.')}
                                >
                                    Error
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => toast.warning('Warning')}>
                                    Warning
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => toast.info('Changes apply on the next page load.')}>
                                    Info
                                </Button>
                            </Example>
                            <Example title="Confirm dialog">
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={async () => {
                                        const confirmed = await confirm({ title: 'Delete this user?', confirmLabel: 'Delete user', tone: 'danger' });
                                        toast.info(confirmed ? 'Confirmed' : 'Cancelled');
                                    }}
                                >
                                    <Trash2 /> Delete…
                                </Button>
                            </Example>
                            <Example title="Dropdown">
                                <Dropdown>
                                    <DropdownTrigger className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                                        <MoreHorizontal /> Actions
                                    </DropdownTrigger>
                                    <DropdownContent align="start">
                                        <DropdownLabel>Row</DropdownLabel>
                                        <DropdownItem icon={<Pencil />}>Edit</DropdownItem>
                                        <DropdownSeparator />
                                        <DropdownItem icon={<Trash2 />} tone="danger">
                                            Delete
                                        </DropdownItem>
                                    </DropdownContent>
                                </Dropdown>
                            </Example>
                            <Example title="Filter tabs & segmented control">
                                <FilterTabs
                                    label="Filter by status"
                                    value={tab}
                                    onChange={setTab}
                                    options={[
                                        { value: 'all', label: 'All', count: 24 },
                                        { value: 'active', label: 'Active', count: 20 },
                                        { value: 'inactive', label: 'Inactive', count: 4 },
                                    ]}
                                />
                                <SegmentedControl
                                    label="Period"
                                    value={segment}
                                    onChange={setSegment}
                                    options={[
                                        { value: 'today', label: 'Today' },
                                        { value: 'week', label: 'This week' },
                                    ]}
                                />
                            </Example>
                            <Pagination
                                currentPage={page}
                                lastPage={12}
                                onPageChange={setPage}
                                from={11}
                                to={20}
                                total={115}
                                perPage={10}
                                onPerPageChange={() => {}}
                            />
                        </Panel.Body>
                    </Panel>
                </Grid.Item>

                <Grid.Item>
                    <FormSection icon={Pencil} title="Form controls" description="Wrap every control in FormField for the label, hint and error.">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <FormField label="Input" htmlFor="ui-input" required hint="Hint text below the field.">
                                <Input id="ui-input" placeholder="Search anything" leadingIcon={<Search />} />
                            </FormField>
                            <FormField label="Invalid input" htmlFor="ui-invalid" error="The name field is required.">
                                <Input id="ui-invalid" invalid />
                            </FormField>
                            <FormField label="Select" htmlFor="ui-select">
                                <Select id="ui-select" options={options} placeholder="All cities" />
                            </FormField>
                            <FormField label="Combobox (searchable)" htmlFor="ui-combobox">
                                <Combobox id="ui-combobox" options={options} value={city} onChange={setCity} clearable />
                            </FormField>
                            <FormField label="Date picker" htmlFor="ui-date" hint={`Value: ${date || '—'}`}>
                                <DatePicker id="ui-date" value={date} onChange={setDate} />
                            </FormField>
                            <FormField label="Currency" htmlFor="ui-amount" hint={`Value: ${amount ?? '—'}`}>
                                <CurrencyInput id="ui-amount" value={amount} onChange={setAmount} />
                            </FormField>
                            <FormField label="Textarea" htmlFor="ui-textarea" className="md:col-span-2">
                                <Textarea id="ui-textarea" placeholder="Notes for approval…" />
                            </FormField>
                            <FormField label="Switch & checkbox" htmlFor="ui-switch">
                                <div className="flex flex-col gap-3">
                                    <Switch
                                        id="ui-switch"
                                        checked={isOn}
                                        onChange={setIsOn}
                                        label="Email notifications"
                                        description="Send a summary every morning."
                                    />
                                    <label className="text-ink-soft flex items-center gap-2 text-sm">
                                        <Checkbox checked={isChecked} onChange={(event) => setIsChecked(event.target.checked)} /> Remember me
                                    </label>
                                </div>
                            </FormField>
                            <FormField label="Radio group (cards)" htmlFor="ui-radio" className="md:col-span-2">
                                <RadioGroup
                                    name="ui-radio"
                                    label="Billing period"
                                    variant="cards"
                                    orientation="horizontal"
                                    value={radio}
                                    onChange={setRadio}
                                    options={[
                                        { value: 'monthly', label: 'Monthly', description: 'Billed every month' },
                                        { value: 'yearly', label: 'Yearly', description: 'Two months free' },
                                    ]}
                                />
                            </FormField>
                            <FormField label="Checkbox group" htmlFor="ui-checks">
                                <CheckboxGroup
                                    label="Channels"
                                    value={checks}
                                    onChange={setChecks}
                                    options={[
                                        { value: 'email', label: 'Email' },
                                        { value: 'sms', label: 'SMS' },
                                        { value: 'whatsapp', label: 'WhatsApp' },
                                    ]}
                                />
                            </FormField>
                            <FormField label="File upload" htmlFor="ui-file" className="md:col-span-2">
                                <FileUpload id="ui-file" value={file} onChange={setFile} accept=".pdf,.xlsx,image/*" maxSizeMb={5} />
                            </FormField>
                            <FormField label="Avatar upload" htmlFor="ui-avatar">
                                <FileUpload id="ui-avatar" variant="avatar" name="Rina Wati" value={null} onChange={() => {}} accept="image/*" />
                            </FormField>
                        </div>
                        <FormActions className="border-line mt-4 border-t pt-4">
                            <Button variant="secondary">Cancel</Button>
                            <Button>Save</Button>
                        </FormActions>
                    </FormSection>
                </Grid.Item>

                <Grid.Item span={{ base: 12, xl: 6 }}>
                    <Panel>
                        <Panel.Header title="Formatting (lib/format.ts)" />
                        <Panel.Body>
                            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                                {[
                                    ['formatCurrency(1250000)', formatCurrency(1250000)],
                                    ['formatNumber(1250000.5)', formatNumber(1250000.5)],
                                    ['formatCompact(1250000)', formatCompact(1250000)],
                                    ['formatPercent(7.5)', formatPercent(7.5)],
                                    ["formatDate('2026-10-17')", formatDate('2026-10-17')],
                                    ["formatDate(now, 'full')", formatDate(new Date(), 'full')],
                                    ['formatDateTime(now)', formatDateTime(new Date())],
                                    ['formatRelative(2 hours ago)', formatRelative(new Date(Date.now() - 2 * 3600 * 1000))],
                                ].map(([code, result]) => (
                                    <div key={code} className="contents">
                                        <dt>
                                            <code className="text-ink-muted text-xs">{code}</code>
                                        </dt>
                                        <dd className="text-ink">{result}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Panel.Body>
                    </Panel>
                </Grid.Item>

                <Grid.Item span={{ base: 12, xl: 6 }}>
                    <Panel isLoading>
                        <Panel.Header title="Loading states (Panel isLoading)" />
                        <Panel.Body className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton shape="circle" className="size-8" />
                                <Skeleton shape="text" className="w-40" />
                            </div>
                            <SkeletonText lines={3} />
                            <Skeleton className="h-24" />
                        </Panel.Body>
                    </Panel>
                </Grid.Item>
            </Grid>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
ComponentCatalog.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Component catalog">
        {page}
    </AdminLayout>
);

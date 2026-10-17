import { Can } from '@/components/admin/can';
import { ListSkeleton } from '@/components/admin/skeletons';
import { TopbarActions } from '@/components/admin/topbar-actions';
import { Badge, Button, buttonVariants, FadeIn, Grid, Panel, useConfirm, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { formatCurrency, formatDateTime, formatRelative } from '@/lib/format';
import { __ } from '@/lib/i18n';
import { type VendorHistoryEntry, type VendorShowProps } from '@/types/vendor';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import { Building2, CreditCard, History, Pencil, Phone, StickyNote, Trash2, TriangleAlert } from 'lucide-react';
import { useState, type ReactElement, type ReactNode } from 'react';

function showBreadcrumbs(vendor: VendorShowProps['vendor']): BreadcrumbEntry[] {
    return [
        { title: 'Vendors', href: '/vendors', icon: Building2 },
        { title: vendor.name, href: route('vendors.show', vendor.id) },
    ];
}

/** Label/value pairs; empty values show a dash so the layout stays the same. */
function Details({ items }: { items: { label: string; value: ReactNode }[] }) {
    return (
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {items.map((item) => (
                <div key={item.label} className="min-w-0">
                    <dt className="text-ink-muted text-xs">{__(item.label)}</dt>
                    <dd className="text-ink mt-0.5 text-sm break-words">{item.value || '—'}</dd>
                </div>
            ))}
        </dl>
    );
}

function HistoryList({ entries }: { entries: VendorHistoryEntry[] }) {
    if (entries.length === 0) {
        return <p className="text-ink-muted text-sm">{__('No activity recorded yet.')}</p>;
    }

    return (
        <ol className="space-y-3">
            {entries.map((entry) => (
                <li key={entry.id} className="border-line border-l-2 pl-3">
                    <p className="text-ink text-sm">{entry.description}</p>
                    <p className="text-ink-subtle text-xs" title={formatDateTime(entry.createdAt)}>
                        {[entry.causer, formatRelative(entry.createdAt)].filter(Boolean).join(' · ')}
                    </p>
                </li>
            ))}
        </ol>
    );
}

/**
 * Vendor details: a real page, so it has its own link and the browser Back button works.
 */
export default function ShowVendor({ vendor, history }: VendorShowProps) {
    const confirm = useConfirm();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteVendor = async () => {
        const confirmed = await confirm({
            title: 'Delete this vendor?',
            description: __(':name (:code) will be removed. This cannot be undone.', { name: vendor.name, code: vendor.code }),
            confirmLabel: 'Delete vendor',
            tone: 'danger',
        });

        if (confirmed) {
            router.delete(route('vendors.destroy', vendor.id), {
                data: { from_detail: true },
                onStart: () => setIsDeleting(true),
                onFinish: () => setIsDeleting(false),
            });
        }
    };

    return (
        <>
            <Head title={vendor.name} />

            <TopbarActions>
                <Can permission="vendors.delete">
                    <Button variant="secondary" size="sm" onClick={deleteVendor} isLoading={isDeleting}>
                        {!isDeleting && <Trash2 />}
                        {__('Delete')}
                    </Button>
                </Can>
                <Can permission="vendors.update">
                    <Link href={route('vendors.edit', vendor.id)} prefetch className={buttonVariants({ size: 'sm' })}>
                        <Pencil />
                        {__('Edit')}
                    </Link>
                </Can>
            </TopbarActions>

            <Grid stagger>
                <Grid.Item span={{ base: 12, xl: 8 }} className="space-y-section">
                    {vendor.isIncomplete && (
                        <div className="rounded-field border-warning/40 bg-warning-soft text-ink flex items-start gap-2 border p-3 text-sm">
                            <TriangleAlert className="text-warning mt-0.5 size-4 shrink-0" />
                            <span>{__('The tax number or bank account is still missing. Complete them before paying this vendor.')}</span>
                        </div>
                    )}

                    <Panel>
                        <Panel.Header
                            title="Vendor information"
                            icon={Building2}
                            actions={
                                <span className="flex flex-wrap items-center gap-1.5">
                                    <Badge shape="pill">{vendor.categoryLabel}</Badge>
                                    <Badge shape="pill" tone={vendor.status === 'active' ? 'success' : 'neutral'}>
                                        {vendor.statusLabel}
                                    </Badge>
                                </span>
                            }
                        />
                        <Panel.Body>
                            <Details
                                items={[
                                    { label: 'Code', value: vendor.code },
                                    { label: 'Contact person', value: vendor.contactPerson },
                                    { label: 'Added', value: formatDateTime(vendor.createdAt) },
                                    { label: 'Last updated', value: formatDateTime(vendor.updatedAt) },
                                ]}
                            />
                        </Panel.Body>
                    </Panel>

                    <Panel>
                        <Panel.Header title="Contact" icon={Phone} />
                        <Panel.Body>
                            <Details
                                items={[
                                    {
                                        label: 'Email',
                                        value: vendor.email && (
                                            <a href={`mailto:${vendor.email}`} className="underline underline-offset-4">
                                                {vendor.email}
                                            </a>
                                        ),
                                    },
                                    { label: 'Phone', value: vendor.phone },
                                    { label: 'Address', value: vendor.address && <span className="whitespace-pre-line">{vendor.address}</span> },
                                ]}
                            />
                        </Panel.Body>
                    </Panel>

                    <Panel>
                        <Panel.Header title="Payment" icon={CreditCard} />
                        <Panel.Body>
                            <Details
                                items={[
                                    { label: 'Tax number (NPWP)', value: vendor.taxNumber },
                                    { label: 'Bank', value: [vendor.bankName, vendor.bankAccountNumber].filter(Boolean).join(' · ') },
                                    { label: 'Payment term', value: __(':days days', { days: vendor.paymentTermDays }) },
                                    { label: 'Credit limit', value: formatCurrency(vendor.creditLimit) },
                                ]}
                            />
                        </Panel.Body>
                    </Panel>

                    {vendor.notes && (
                        <Panel>
                            <Panel.Header title="Notes" icon={StickyNote} />
                            <Panel.Body>
                                <p className="text-ink-soft text-sm whitespace-pre-line">{vendor.notes}</p>
                            </Panel.Body>
                        </Panel>
                    )}
                </Grid.Item>

                <Grid.Item span={{ base: 12, xl: 4 }}>
                    <Panel>
                        <Panel.Header title="History" icon={History} />
                        <Panel.Body className="scrollbar-thin max-h-[calc(100dvh-12rem)] overflow-y-auto">
                            <Deferred data="history" fallback={<ListSkeleton rows={4} />}>
                                <FadeIn variant="fade">
                                    <HistoryList entries={history ?? []} />
                                </FadeIn>
                            </Deferred>
                        </Panel.Body>
                    </Panel>
                </Grid.Item>
            </Grid>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
ShowVendor.layout = (page: ReactElement<VendorShowProps>) => (
    <AdminLayout breadcrumbs={showBreadcrumbs(page.props.vendor)} title=":name" titleParams={{ name: page.props.vendor.name }}>
        {page}
    </AdminLayout>
);

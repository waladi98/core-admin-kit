import {
    Button,
    buttonVariants,
    CurrencyInput,
    FormActions,
    FormField,
    FormSection,
    Input,
    Select,
    Textarea,
    type BreadcrumbEntry,
} from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import { __ } from '@/lib/i18n';
import { type VendorCategory, type VendorEditProps, type VendorStatus } from '@/types/vendor';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Check, CreditCard, Phone, StickyNote } from 'lucide-react';
import { type FormEventHandler, type ReactElement } from 'react';

function editBreadcrumbs(vendor: VendorEditProps['vendor']): BreadcrumbEntry[] {
    return [
        { title: 'Vendors', href: '/vendors', icon: Building2 },
        { title: vendor.name, href: route('vendors.show', vendor.id) },
        { title: 'Edit', href: route('vendors.edit', vendor.id) },
    ];
}

interface VendorFormData {
    name: string;
    category: VendorCategory;
    status: VendorStatus;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    tax_number: string;
    bank_name: string;
    bank_account_number: string;
    payment_term_days: number;
    credit_limit: number;
    notes: string;
    [key: string]: string | number;
}

/**
 * Full vendor form on its own page: many fields in sections, so it does not fit a modal.
 */
export default function EditVendor({ vendor, categoryOptions, statusOptions }: VendorEditProps) {
    const { data, setData, put, errors, processing } = useForm<VendorFormData>({
        name: vendor.name,
        category: vendor.category,
        status: vendor.status,
        contact_person: vendor.contactPerson ?? '',
        email: vendor.email ?? '',
        phone: vendor.phone ?? '',
        address: vendor.address ?? '',
        tax_number: vendor.taxNumber ?? '',
        bank_name: vendor.bankName ?? '',
        bank_account_number: vendor.bankAccountNumber ?? '',
        payment_term_days: vendor.paymentTermDays,
        credit_limit: vendor.creditLimit,
        notes: vendor.notes ?? '',
    });

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        put(route('vendors.update', vendor.id), { preserveScroll: true });
    };

    return (
        <>
            <Head title={__('Edit :name', { name: vendor.name })} />

            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSection icon={Building2} title="Vendor information" description="Name, category and whether the vendor can still be used.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Vendor name" htmlFor="name" required error={errors.name}>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                invalid={Boolean(errors.name)}
                            />
                        </FormField>
                        <FormField label="Category" htmlFor="category" required error={errors.category}>
                            <Select
                                id="category"
                                options={categoryOptions}
                                value={data.category}
                                onChange={(event) => setData('category', event.target.value as VendorCategory)}
                                invalid={Boolean(errors.category)}
                            />
                        </FormField>
                        <FormField
                            label="Status"
                            htmlFor="status"
                            required
                            hint="Inactive vendors are kept but should not get new orders."
                            error={errors.status}
                        >
                            <Select
                                id="status"
                                options={statusOptions}
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value as VendorStatus)}
                                invalid={Boolean(errors.status)}
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection icon={Phone} title="Contact" description="Who to reach for orders and invoices.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Contact person" htmlFor="contact_person" error={errors.contact_person}>
                            <Input
                                id="contact_person"
                                value={data.contact_person}
                                onChange={(event) => setData('contact_person', event.target.value)}
                                autoComplete="off"
                                invalid={Boolean(errors.contact_person)}
                            />
                        </FormField>
                        <FormField label="Email" htmlFor="email" error={errors.email}>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                autoComplete="off"
                                invalid={Boolean(errors.email)}
                            />
                        </FormField>
                        <FormField label="Phone" htmlFor="phone" error={errors.phone}>
                            <Input
                                id="phone"
                                type="tel"
                                value={data.phone}
                                onChange={(event) => setData('phone', event.target.value)}
                                autoComplete="off"
                                invalid={Boolean(errors.phone)}
                            />
                        </FormField>
                        <FormField label="Address" htmlFor="address" error={errors.address} className="md:col-span-2 xl:col-span-3">
                            <Textarea
                                id="address"
                                rows={2}
                                value={data.address}
                                onChange={(event) => setData('address', event.target.value)}
                                invalid={Boolean(errors.address)}
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection icon={CreditCard} title="Payment" description="Needed before the vendor can be paid.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField label="Tax number (NPWP)" htmlFor="tax_number" error={errors.tax_number}>
                            <Input
                                id="tax_number"
                                value={data.tax_number}
                                onChange={(event) => setData('tax_number', event.target.value)}
                                placeholder="01.234.567.8-901.000"
                                invalid={Boolean(errors.tax_number)}
                            />
                        </FormField>
                        <FormField label="Bank" htmlFor="bank_name" error={errors.bank_name}>
                            <Input
                                id="bank_name"
                                value={data.bank_name}
                                onChange={(event) => setData('bank_name', event.target.value)}
                                placeholder="BCA"
                                invalid={Boolean(errors.bank_name)}
                            />
                        </FormField>
                        <FormField label="Account number" htmlFor="bank_account_number" error={errors.bank_account_number}>
                            <Input
                                id="bank_account_number"
                                inputMode="numeric"
                                value={data.bank_account_number}
                                onChange={(event) => setData('bank_account_number', event.target.value)}
                                invalid={Boolean(errors.bank_account_number)}
                            />
                        </FormField>
                        <FormField
                            label="Payment term (days)"
                            htmlFor="payment_term_days"
                            required
                            hint="0 means paid on delivery."
                            error={errors.payment_term_days}
                        >
                            <Input
                                id="payment_term_days"
                                type="number"
                                min={0}
                                max={365}
                                value={data.payment_term_days}
                                onChange={(event) => setData('payment_term_days', Number(event.target.value))}
                                required
                                invalid={Boolean(errors.payment_term_days)}
                            />
                        </FormField>
                        <FormField
                            label="Credit limit"
                            htmlFor="credit_limit"
                            required
                            hint="Highest unpaid amount allowed."
                            error={errors.credit_limit}
                        >
                            <CurrencyInput
                                id="credit_limit"
                                value={data.credit_limit}
                                onChange={(value) => setData('credit_limit', value ?? 0)}
                                invalid={Boolean(errors.credit_limit)}
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormSection icon={StickyNote} title="Notes" description="Internal notes, not shared with the vendor.">
                    <FormField label="Notes" htmlFor="notes" error={errors.notes}>
                        <Textarea
                            id="notes"
                            rows={3}
                            value={data.notes}
                            onChange={(event) => setData('notes', event.target.value)}
                            invalid={Boolean(errors.notes)}
                        />
                    </FormField>
                </FormSection>

                <FormActions sticky>
                    <Link href={route('vendors.show', vendor.id)} className={buttonVariants({ variant: 'secondary' })}>
                        {__('Cancel')}
                    </Link>
                    <Button type="submit" isLoading={processing}>
                        {!processing && <Check />}
                        {__('Save changes')}
                    </Button>
                </FormActions>
            </form>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
EditVendor.layout = (page: ReactElement<VendorEditProps>) => (
    <AdminLayout breadcrumbs={editBreadcrumbs(page.props.vendor)} title="Edit vendor · :name" titleParams={{ name: page.props.vendor.name }}>
        {page}
    </AdminLayout>
);

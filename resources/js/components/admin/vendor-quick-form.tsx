import { Button, FormField, Input, Modal, ModalFooter, Select, type SelectOption } from '@/components/core';
import { __ } from '@/lib/i18n';
import { type Vendor, type VendorCategory, type VendorQuickFormData } from '@/types/vendor';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import { useEffect, type FormEventHandler } from 'react';

export interface VendorQuickFormProps {
    isOpen: boolean;
    onClose: () => void;
    /** The vendor to quick edit; omit to quick add. */
    vendor?: Vendor | null;
    categoryOptions: SelectOption[];
}

function initialData(vendor?: Vendor | null): VendorQuickFormData {
    return {
        name: vendor?.name ?? '',
        category: vendor?.category ?? 'goods',
        email: vendor?.email ?? '',
        phone: vendor?.phone ?? '',
        continue: false,
    };
}

/**
 * Quick add / quick edit modal on the vendors list: only the few core fields.
 * Validation errors stay in the modal; it closes only after a successful save.
 * Everything else (address, tax, bank, credit limit) is on the full edit page.
 */
export function VendorQuickForm({ isOpen, onClose, vendor, categoryOptions }: VendorQuickFormProps) {
    const isEditing = Boolean(vendor);
    const form = useForm<VendorQuickFormData>(initialData(vendor));

    // Load the chosen vendor (or an empty form) each time the modal opens.
    useEffect(() => {
        if (isOpen) {
            form.setDefaults(initialData(vendor));
            form.setData(initialData(vendor));
            form.clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the modal opens or the vendor changes
    }, [isOpen, vendor?.id]);

    const save = (shouldContinue: boolean) => {
        const options = {
            preserveScroll: true,
            preserveState: true,
            only: ['vendors', 'statusCounts'],
            onSuccess: () => onClose(),
        };

        if (vendor) {
            form.patch(route('vendors.quick-update', vendor.id), options);
        } else {
            form.transform((data) => ({ ...data, continue: shouldContinue }));
            form.post(route('vendors.store'), options);
        }
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();
        save(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !form.processing && onClose()}
            title={isEditing ? 'Quick edit vendor' : 'Add vendor'}
            description={
                isEditing
                    ? 'Change the basic details. Open "Edit all details" for address, tax and bank data.'
                    : 'Start with the basics; you can complete the details later.'
            }
        >
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <FormField label="Vendor name" htmlFor="vendor-name" required error={form.errors.name} className="sm:col-span-2">
                    <Input
                        id="vendor-name"
                        value={form.data.name}
                        onChange={(event) => form.setData('name', event.target.value)}
                        required
                        autoFocus
                        autoComplete="off"
                        placeholder={__('e.g. PT Sinar Jaya')}
                        invalid={Boolean(form.errors.name)}
                    />
                </FormField>

                <FormField label="Category" htmlFor="vendor-category" required error={form.errors.category} className="sm:col-span-2">
                    <Select
                        id="vendor-category"
                        options={categoryOptions}
                        value={form.data.category}
                        onChange={(event) => form.setData('category', event.target.value as VendorCategory)}
                        invalid={Boolean(form.errors.category)}
                    />
                </FormField>

                <FormField label="Email" htmlFor="vendor-email" error={form.errors.email}>
                    <Input
                        id="vendor-email"
                        type="email"
                        value={form.data.email}
                        onChange={(event) => form.setData('email', event.target.value)}
                        autoComplete="off"
                        placeholder={__('finance@vendor.com')}
                        invalid={Boolean(form.errors.email)}
                    />
                </FormField>

                <FormField label="Phone" htmlFor="vendor-phone" error={form.errors.phone}>
                    <Input
                        id="vendor-phone"
                        type="tel"
                        value={form.data.phone}
                        onChange={(event) => form.setData('phone', event.target.value)}
                        autoComplete="off"
                        placeholder="0812 3456 7890"
                        invalid={Boolean(form.errors.phone)}
                    />
                </FormField>

                <ModalFooter className="sm:col-span-2">
                    <Button variant="secondary" onClick={onClose} disabled={form.processing}>
                        {__('Cancel')}
                    </Button>
                    {!isEditing && (
                        <Button variant="secondary" onClick={() => save(true)} disabled={form.processing}>
                            {__('Save & complete details')}
                            <ArrowRight />
                        </Button>
                    )}
                    <Button type="submit" isLoading={form.processing}>
                        {!form.processing && <Check />}
                        {isEditing ? __('Save changes') : __('Save')}
                    </Button>
                </ModalFooter>
            </form>
        </Modal>
    );
}

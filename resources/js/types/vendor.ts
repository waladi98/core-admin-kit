import { type SelectOption } from '@/components/core';
import { type Paginated } from '@/types/user-management';

export type VendorCategory = 'goods' | 'services' | 'logistics' | 'utilities';

export type VendorStatus = 'active' | 'inactive';

/** A vendor row as sent by `VendorController` (list and quick edit). */
export interface Vendor {
    id: number;
    /** Reference such as "VND-0007". */
    code: string;
    name: string;
    category: VendorCategory;
    categoryLabel: string;
    email: string | null;
    phone: string | null;
    contactPerson: string | null;
    /** Rupiah, whole units. */
    creditLimit: number;
    status: VendorStatus;
    statusLabel: string;
    /** Quick-added vendors still miss the tax number or bank account. */
    isIncomplete: boolean;
    createdAt: string;
}

/** Every field, for the detail and full edit pages. */
export interface VendorDetail extends Vendor {
    address: string | null;
    taxNumber: string | null;
    bankName: string | null;
    bankAccountNumber: string | null;
    paymentTermDays: number;
    notes: string | null;
    updatedAt: string;
}

export interface VendorFilters {
    search: string | null;
    category: VendorCategory | null;
    status: VendorStatus | null;
    /** `name`, `credit_limit` or `created_at`; prefixed with `-` for descending. */
    sort: string;
    perPage: number;
}

export interface VendorIndexProps {
    vendors: Paginated<Vendor>;
    filters: VendorFilters;
    statusCounts: Record<'all' | VendorStatus, number>;
    categoryOptions: SelectOption[];
}

export interface VendorHistoryEntry {
    id: number;
    event: string;
    description: string;
    causer: string | null;
    createdAt: string;
}

export interface VendorShowProps {
    vendor: VendorDetail;
    /** Deferred: loaded after the page renders. */
    history?: VendorHistoryEntry[];
}

export interface VendorEditProps {
    vendor: VendorDetail;
    categoryOptions: SelectOption[];
    statusOptions: SelectOption[];
}

/** Fields of the quick add / quick edit modal. */
export interface VendorQuickFormData {
    name: string;
    category: VendorCategory;
    email: string;
    phone: string;
    /** Quick add only: open the full edit page after saving. */
    continue: boolean;
    [key: string]: string | boolean;
}

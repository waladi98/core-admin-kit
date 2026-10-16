import { type SelectOption } from '@/components/core';

export type UserRole = 'admin' | 'manager' | 'staff';

export type UserStatus = 'active' | 'inactive';

/** A user row as sent by `UserController`. */
export interface ManagedUser {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: UserRole;
    roleLabel: string;
    status: UserStatus;
    statusLabel: string;
    createdAt: string;
}

export interface Paginated<T> {
    data: T[];
    currentPage: number;
    lastPage: number;
    perPage: number;
    from: number | null;
    to: number | null;
    total: number;
}

export interface UserFilters {
    search: string | null;
    role: UserRole | null;
    status: UserStatus | null;
    /** `name`, `email` or `created_at`; prefixed with `-` for descending. */
    sort: string;
    perPage: number;
}

/** Number of users per status tab, after search and role filters. */
export type UserStatusCounts = Record<'all' | UserStatus, number>;

export interface UserIndexProps {
    users: Paginated<ManagedUser>;
    filters: UserFilters;
    statusCounts: UserStatusCounts;
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
}

export interface UserFormOptions {
    roleOptions: SelectOption[];
    statusOptions: SelectOption[];
}

export interface UserEditProps extends UserFormOptions {
    user: ManagedUser;
}

/** Fields submitted by the create/edit form. */
export interface UserFormData {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    password: string;
    password_confirmation: string;
    [key: string]: string;
}

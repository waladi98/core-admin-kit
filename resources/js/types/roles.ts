/** A role as sent by `RoleController`. */
export interface ManagedRole {
    id: number;
    /** Slug stored in the database, e.g. `finance-lead`. */
    name: string;
    /** Display name, e.g. `Finance Lead`. */
    label: string;
    /** The admin role always has every permission and cannot be edited. */
    isAdmin: boolean;
    /** admin, manager and staff: cannot be renamed or deleted. */
    isBuiltIn: boolean;
}

export interface RoleRow extends ManagedRole {
    usersCount: number;
    permissionsCount: number;
}

export interface PermissionOption {
    value: string;
    label: string;
}

export interface PermissionGroup {
    group: string;
    permissions: PermissionOption[];
}

export interface RoleIndexProps {
    roles: RoleRow[];
    totalPermissions: number;
}

export interface RoleCreateProps {
    permissionGroups: PermissionGroup[];
}

export interface RoleEditProps extends RoleCreateProps {
    role: ManagedRole & { permissions: string[] };
    /** False for the admin role or when the user may only view roles. */
    canUpdate: boolean;
}

export interface RoleFormData {
    name: string;
    permissions: string[];
    [key: string]: string | string[];
}

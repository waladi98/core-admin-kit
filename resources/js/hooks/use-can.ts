import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

/**
 * Returns a checker for the signed-in user's permissions (shared as `auth.permissions`).
 *
 * The server still enforces every permission; this only hides what the user cannot use.
 */
export function usePermissions(): (permission: string | string[]) => boolean {
    const { auth } = usePage<SharedData>().props;
    const permissions = useMemo(() => new Set(auth.permissions ?? []), [auth.permissions]);

    return useCallback(
        (permission: string | string[]) => {
            const required = Array.isArray(permission) ? permission : [permission];

            return required.some((name) => permissions.has(name));
        },
        [permissions],
    );
}

/**
 * True when the user has the permission, or any of them when given a list.
 */
export function useCan(permission: string | string[]): boolean {
    return usePermissions()(permission);
}

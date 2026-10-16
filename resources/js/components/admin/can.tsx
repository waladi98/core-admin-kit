import { useCan } from '@/hooks/use-can';
import { type ReactNode } from 'react';

export interface CanProps {
    /** Permission name, or a list where any one is enough. */
    permission: string | string[];
    /** Rendered when the user lacks the permission. Defaults to nothing. */
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * Shows its children only when the signed-in user has the permission.
 *
 * ```tsx
 * <Can permission="users.create">
 *     <Link href={route('users.create')}>Add user</Link>
 * </Can>
 * ```
 */
export function Can({ permission, fallback = null, children }: CanProps) {
    return useCan(permission) ? children : fallback;
}

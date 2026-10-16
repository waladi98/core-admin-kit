import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useState } from 'react';

export const avatarVariants = cva(
    'relative inline-flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-medium text-ink-soft ring-1 ring-line',
    {
        variants: {
            size: {
                xs: 'size-5 text-[9px]',
                sm: 'size-6 text-[10px]',
                md: 'size-8 text-xs',
                lg: 'size-10 text-sm',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    },
);

const statusDotSizes = {
    xs: 'size-1.5',
    sm: 'size-2',
    md: 'size-2.5',
    lg: 'size-3',
} as const;

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
    name: string;
    src?: string | null;
    isOnline?: boolean;
    className?: string;
}

export function getInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return '';
    }

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}

export function Avatar({ name, src, size, isOnline, className }: AvatarProps) {
    const [hasImageError, setHasImageError] = useState(false);
    const shouldShowImage = Boolean(src) && !hasImageError;

    return (
        <span className={cn(avatarVariants({ size }), className)}>
            {shouldShowImage ? (
                <img src={src ?? undefined} alt={name} className="size-full rounded-full object-cover" onError={() => setHasImageError(true)} />
            ) : (
                <span aria-hidden="true">{getInitials(name)}</span>
            )}
            {isOnline !== undefined && (
                <span
                    className={cn(
                        'ring-surface absolute right-0 bottom-0 rounded-full ring-2',
                        statusDotSizes[size ?? 'md'],
                        isOnline ? 'bg-success' : 'bg-ink-subtle',
                    )}
                />
            )}
        </span>
    );
}

import { cn } from '@/lib/utils';
import { Menu, MenuButton, MenuItem, MenuItems, MenuSeparator, type MenuItemsProps } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { type ComponentProps, type ReactNode } from 'react';

/**
 * Finance Core dropdown menu.
 *
 * This is the only file that knows about Headless UI's Menu. Pages and
 * widgets must import from here so the underlying library can be swapped.
 */
export function Dropdown({ className, ...props }: ComponentProps<'div'>) {
    return <Menu as="div" className={cn('relative inline-flex', className)} {...props} />;
}

export function DropdownTrigger({ className, ...props }: ComponentProps<'button'>) {
    return <MenuButton className={cn('outline-none', className)} {...props} />;
}

export interface DropdownContentProps {
    align?: 'start' | 'end';
    side?: 'top' | 'bottom' | 'right';
    className?: string;
    children: ReactNode;
}

const anchors: Record<string, MenuItemsProps['anchor']> = {
    'bottom-start': 'bottom start',
    'bottom-end': 'bottom end',
    'top-start': 'top start',
    'top-end': 'top end',
    'right-start': 'right start',
    'right-end': 'right end',
};

export function DropdownContent({ align = 'end', side = 'bottom', className, children }: DropdownContentProps) {
    return (
        <MenuItems
            anchor={anchors[`${side}-${align}`]}
            transition
            className={cn(
                'rounded-field border-line bg-surface shadow-pop z-50 min-w-44 border p-1 text-sm outline-none [--anchor-gap:6px]',
                'origin-top transition duration-100 ease-out data-closed:scale-95 data-closed:opacity-0',
                className,
            )}
        >
            {children}
        </MenuItems>
    );
}

export interface DropdownItemProps {
    icon?: ReactNode;
    shortcut?: string;
    tone?: 'default' | 'danger';
    disabled?: boolean;
    onSelect?: () => void;
    /** Navigates with Inertia when set. */
    href?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    className?: string;
    children: ReactNode;
}

export function DropdownItem({ icon, shortcut, tone = 'default', disabled, onSelect, href, method = 'get', className, children }: DropdownItemProps) {
    const itemClassName = cn(
        'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        tone === 'danger' ? 'text-danger data-focus:bg-danger-soft' : 'text-ink-soft data-focus:bg-surface-hover data-focus:text-ink',
        className,
    );

    const content = (
        <>
            {icon && <span className="flex text-current opacity-80">{icon}</span>}
            <span className="flex-1">{children}</span>
            {shortcut && <span className="text-ink-subtle text-xs">{shortcut}</span>}
        </>
    );

    return (
        <MenuItem disabled={disabled}>
            {href ? (
                <Link href={href} method={method} as={method === 'get' ? 'a' : 'button'} onClick={onSelect} className={itemClassName}>
                    {content}
                </Link>
            ) : (
                <button type="button" onClick={onSelect} className={itemClassName}>
                    {content}
                </button>
            )}
        </MenuItem>
    );
}

export function DropdownLabel({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('text-ink-muted px-2 py-1.5 text-xs font-medium', className)} {...props} />;
}

export function DropdownSeparator({ className }: { className?: string }) {
    return <MenuSeparator className={cn('bg-line my-1 h-px', className)} />;
}

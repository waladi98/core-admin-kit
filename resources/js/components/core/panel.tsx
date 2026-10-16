import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';

export interface PanelProps extends ComponentProps<'section'> {
    /** Dims the body content and shows a thin progress bar while data reloads. */
    isLoading?: boolean;
}

/**
 * Outer muted card. Combine with <PanelHeader> and <PanelBody> to get the
 * "card inside a card" look from the reference design.
 */
export function Panel({ isLoading = false, className, ...props }: PanelProps) {
    return (
        <section
            data-loading={isLoading}
            aria-busy={isLoading || undefined}
            className={cn('group/panel rounded-panel border-line bg-surface-muted flex h-full flex-col border p-1', className)}
            {...props}
        />
    );
}

export interface PanelHeaderProps {
    title: ReactNode;
    icon?: LucideIcon;
    /** Icon shown on the right side when there are no actions, as in the reference stat cards. */
    trailingIcon?: LucideIcon;
    actions?: ReactNode;
    className?: string;
}

export function PanelHeader({ title, icon: Icon, trailingIcon: TrailingIcon, actions, className }: PanelHeaderProps) {
    return (
        <header className={cn('flex min-h-10 flex-wrap items-center gap-2 px-3 py-1.5', className)}>
            {Icon && <Icon className="text-ink-muted size-4 shrink-0" />}
            <h2 className="text-ink-soft min-w-24 flex-1 truncate text-sm font-medium">{title}</h2>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            {!actions && TrailingIcon && <TrailingIcon className="text-ink-muted size-4 shrink-0" />}
        </header>
    );
}

export interface PanelBodyProps extends ComponentProps<'div'> {
    padding?: 'none' | 'sm' | 'md';
}

const bodyPaddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
} as const;

export function PanelBody({ padding = 'md', className, children, ...props }: PanelBodyProps) {
    return (
        <div
            className={cn(
                'rounded-panel border-line bg-surface shadow-panel relative flex-1 overflow-hidden border',
                '[&>*:not([data-panel-progress])]:transition-opacity [&>*:not([data-panel-progress])]:duration-200',
                'group-data-[loading=true]/panel:[&>*:not([data-panel-progress])]:pointer-events-none group-data-[loading=true]/panel:[&>*:not([data-panel-progress])]:opacity-50',
                bodyPaddings[padding],
                className,
            )}
            {...props}
        >
            <span
                data-panel-progress
                aria-hidden="true"
                className="absolute inset-x-0 top-0 hidden h-0.5 overflow-hidden group-data-[loading=true]/panel:block"
            >
                <span className="animate-progress bg-brand block h-full w-2/5 rounded-full" />
            </span>
            {children}
        </div>
    );
}

Panel.Header = PanelHeader;
Panel.Body = PanelBody;

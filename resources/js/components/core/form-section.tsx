import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';
import { Label } from './label';

export interface FormSectionProps {
    title: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
    /** Extra controls on the right side of the section header. */
    actions?: ReactNode;
    className?: string;
    bodyClassName?: string;
    children: ReactNode;
}

/**
 * White card that groups related form fields: icon, title and description,
 * a divider, then the fields.
 */
export function FormSection({ title, description, icon: Icon, actions, className, bodyClassName, children }: FormSectionProps) {
    return (
        <section className={cn('rounded-panel border-line bg-surface shadow-panel border', className)}>
            <header className="border-line flex items-center gap-3 border-b px-4 py-3">
                {Icon && (
                    <span className="rounded-field border-line text-ink-soft flex size-9 shrink-0 items-center justify-center border">
                        <Icon className="size-4" />
                    </span>
                )}
                <div className="min-w-0 flex-1">
                    <h2 className="text-ink text-sm font-semibold">{title}</h2>
                    {description && <p className="text-ink-muted mt-0.5 text-xs">{description}</p>}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </header>
            <div className={cn('p-4', bodyClassName)}>{children}</div>
        </section>
    );
}

export interface FormFieldProps {
    label: ReactNode;
    htmlFor: string;
    required?: boolean;
    /** Helper text below the control, hidden while an error is shown. */
    hint?: ReactNode;
    error?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Label, control, hint and error message for one form field.
 */
export function FormField({ label, htmlFor, required = false, hint, error, className, children }: FormFieldProps) {
    return (
        <div className={cn('grid content-start gap-1.5', className)}>
            <Label htmlFor={htmlFor} required={required}>
                {label}
            </Label>
            {children}
            {error ? <p className="text-danger text-xs">{error}</p> : hint && <p className="text-ink-muted text-xs">{hint}</p>}
        </div>
    );
}

/**
 * Footer row with the form buttons, aligned to the right below the form sections.
 */
export function FormActions({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end', className)} {...props} />;
}

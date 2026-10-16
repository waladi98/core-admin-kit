import { Button, Checkbox, FormActions, FormField, FormSection, Input, buttonVariants } from '@/components/core';
import { cn } from '@/lib/utils';
import { type PermissionGroup, type RoleFormData } from '@/types/roles';
import { Link, useForm } from '@inertiajs/react';
import { Check, Info, KeyRound, LockKeyhole } from 'lucide-react';
import { type FormEventHandler } from 'react';

export interface RoleFormProps {
    initialValues: RoleFormData;
    permissionGroups: PermissionGroup[];
    method: 'post' | 'put';
    action: string;
    submitLabel: string;
    /** Built-in roles keep their name; only their permissions change. */
    isNameLocked?: boolean;
    /** Read-only view, e.g. the admin role or a user who may only view roles. */
    isReadOnly?: boolean;
    readOnlyReason?: string;
}

export function RoleForm({
    initialValues,
    permissionGroups,
    method,
    action,
    submitLabel,
    isNameLocked = false,
    isReadOnly = false,
    readOnlyReason,
}: RoleFormProps) {
    const { data, setData, submit, errors, processing } = useForm<RoleFormData>(initialValues);
    const selected = new Set(data.permissions);
    const totalPermissions = permissionGroups.reduce((total, group) => total + group.permissions.length, 0);

    const togglePermission = (permission: string) => {
        const next = new Set(selected);

        if (next.has(permission)) {
            next.delete(permission);
        } else {
            next.add(permission);
        }

        setData('permissions', [...next]);
    };

    const toggleGroup = (group: PermissionGroup, shouldSelect: boolean) => {
        const next = new Set(selected);
        group.permissions.forEach((permission) => (shouldSelect ? next.add(permission.value) : next.delete(permission.value)));
        setData('permissions', [...next]);
    };

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        if (!isReadOnly) {
            submit(method, action, { preserveScroll: true });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-section">
            {isReadOnly && readOnlyReason && (
                <p className="rounded-field border-info/30 bg-info-soft text-ink-soft flex items-center gap-2 border px-3 py-2 text-sm">
                    <Info className="text-info size-4 shrink-0" />
                    {readOnlyReason}
                </p>
            )}

            <FormSection icon={LockKeyhole} title="Role details" description="A short, clear name such as Finance Lead or Auditor.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField
                        label="Role name"
                        htmlFor="name"
                        required
                        hint={isNameLocked ? 'Built-in roles cannot be renamed.' : 'Saved as a lowercase name, e.g. finance-lead.'}
                        error={errors.name}
                    >
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            disabled={isNameLocked || isReadOnly}
                            autoComplete="off"
                            placeholder="e.g. Finance Lead"
                            invalid={Boolean(errors.name)}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                icon={KeyRound}
                title="Permissions"
                description="Tick what people with this role can do."
                actions={
                    <span className="text-ink-muted text-xs">
                        <span className="text-ink font-semibold">{selected.size}</span> of {totalPermissions} selected
                    </span>
                }
            >
                {errors.permissions && <p className="text-danger mb-3 text-xs">{errors.permissions}</p>}

                <div className="gap-section grid md:grid-cols-2 xl:grid-cols-3">
                    {permissionGroups.map((group) => {
                        const selectedInGroup = group.permissions.filter((permission) => selected.has(permission.value)).length;
                        const isAllSelected = selectedInGroup === group.permissions.length;
                        const groupId = `group-${group.group.replace(/\W+/g, '-').toLowerCase()}`;

                        return (
                            <fieldset key={group.group} className="rounded-field border-line border">
                                <legend className="sr-only">{group.group}</legend>
                                <label
                                    htmlFor={groupId}
                                    className={cn(
                                        'border-line bg-surface-muted flex items-center gap-2.5 border-b px-3 py-2',
                                        !isReadOnly && 'cursor-pointer',
                                    )}
                                >
                                    <Checkbox
                                        id={groupId}
                                        checked={isAllSelected}
                                        indeterminate={selectedInGroup > 0 && !isAllSelected}
                                        onChange={() => toggleGroup(group, !isAllSelected)}
                                        disabled={isReadOnly}
                                    />
                                    <span className="text-ink flex-1 text-sm font-medium">{group.group}</span>
                                    <span className="text-ink-muted text-xs">
                                        {selectedInGroup}/{group.permissions.length}
                                    </span>
                                </label>
                                <ul className="space-y-1 p-2">
                                    {group.permissions.map((permission) => {
                                        const permissionId = `permission-${permission.value.replace('.', '-')}`;

                                        return (
                                            <li key={permission.value}>
                                                <label
                                                    htmlFor={permissionId}
                                                    className={cn(
                                                        'rounded-field flex items-center gap-2.5 px-1.5 py-1.5',
                                                        !isReadOnly && 'hover:bg-surface-hover cursor-pointer',
                                                    )}
                                                >
                                                    <Checkbox
                                                        id={permissionId}
                                                        checked={selected.has(permission.value)}
                                                        onChange={() => togglePermission(permission.value)}
                                                        disabled={isReadOnly}
                                                    />
                                                    <span className="text-ink-soft min-w-0 flex-1 text-[13px]">{permission.label}</span>
                                                    <code className="text-ink-subtle hidden text-xs sm:inline">{permission.value}</code>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </fieldset>
                        );
                    })}
                </div>
            </FormSection>

            <FormActions sticky>
                <Link href={route('roles.index')} className={buttonVariants({ variant: 'secondary' })}>
                    {isReadOnly ? 'Back' : 'Cancel'}
                </Link>
                {!isReadOnly && (
                    <Button type="submit" isLoading={processing}>
                        {!processing && <Check />}
                        {submitLabel}
                    </Button>
                )}
            </FormActions>
        </form>
    );
}

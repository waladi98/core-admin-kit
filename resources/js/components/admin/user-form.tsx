import { Button, Input, Label, Panel, Select } from '@/components/core';
import InputError from '@/components/input-error';
import { type UserFormData, type UserFormOptions } from '@/types/user-management';
import { Link, useForm } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import { type FormEventHandler } from 'react';

export interface UserFormProps extends UserFormOptions {
    initialValues: UserFormData;
    method: 'post' | 'put';
    action: string;
    submitLabel: string;
    /** On edit, an empty password keeps the current one. */
    isPasswordOptional?: boolean;
}

export function UserForm({ initialValues, method, action, submitLabel, isPasswordOptional = false, roleOptions, statusOptions }: UserFormProps) {
    const { data, setData, submit, errors, processing } = useForm<UserFormData>(initialValues);

    const handleSubmit: FormEventHandler = (event) => {
        event.preventDefault();

        submit(method, action, { preserveScroll: true });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Panel>
                <Panel.Header title="Account details" icon={UserRound} />
                <Panel.Body className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                autoComplete="off"
                                placeholder="Full name"
                                invalid={Boolean(errors.name)}
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(event) => setData('email', event.target.value)}
                                required
                                autoComplete="off"
                                placeholder="name@company.com"
                                invalid={Boolean(errors.email)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                id="role"
                                options={roleOptions}
                                value={data.role}
                                onChange={(event) => setData('role', event.target.value as UserFormData['role'])}
                                invalid={Boolean(errors.role)}
                            />
                            <InputError message={errors.role} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                id="status"
                                options={statusOptions}
                                value={data.status}
                                onChange={(event) => setData('status', event.target.value as UserFormData['status'])}
                                invalid={Boolean(errors.status)}
                            />
                            <InputError message={errors.status} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                required={!isPasswordOptional}
                                autoComplete="new-password"
                                placeholder={isPasswordOptional ? 'Leave blank to keep current password' : 'Password'}
                                invalid={Boolean(errors.password)}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(event) => setData('password_confirmation', event.target.value)}
                                required={!isPasswordOptional}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                invalid={Boolean(errors.password_confirmation)}
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>
                    </div>

                    <div className="border-line flex items-center justify-end gap-2 border-t pt-4">
                        <Link href={route('users.index')} className="text-ink-soft hover:text-ink px-3 text-sm font-medium">
                            Cancel
                        </Link>
                        <Button type="submit" isLoading={processing}>
                            {submitLabel}
                        </Button>
                    </div>
                </Panel.Body>
            </Panel>
        </form>
    );
}

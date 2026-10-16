import { Button, FormActions, FormField, FormSection, Input, Select, buttonVariants } from '@/components/core';
import { type UserFormData, type UserFormOptions } from '@/types/user-management';
import { Link, useForm } from '@inertiajs/react';
import { Check, KeyRound, UserRound } from 'lucide-react';
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormSection icon={UserRound} title="User information" description="Basic profile, role and account status.">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField label="Name" htmlFor="name" required error={errors.name}>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            autoComplete="off"
                            placeholder="Full name"
                            invalid={Boolean(errors.name)}
                        />
                    </FormField>

                    <FormField label="Email address" htmlFor="email" required hint="Used to sign in." error={errors.email}>
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
                    </FormField>

                    <FormField label="Role" htmlFor="role" required hint="Determines what the user can access." error={errors.role}>
                        <Select
                            id="role"
                            options={roleOptions}
                            value={data.role}
                            onChange={(event) => setData('role', event.target.value as UserFormData['role'])}
                            invalid={Boolean(errors.role)}
                        />
                    </FormField>

                    <FormField label="Status" htmlFor="status" required hint="Inactive users cannot sign in." error={errors.status}>
                        <Select
                            id="status"
                            options={statusOptions}
                            value={data.status}
                            onChange={(event) => setData('status', event.target.value as UserFormData['status'])}
                            invalid={Boolean(errors.status)}
                        />
                    </FormField>
                </div>
            </FormSection>

            <FormSection
                icon={KeyRound}
                title="Password"
                description={isPasswordOptional ? 'Leave both fields empty to keep the current password.' : 'Set the password used to sign in.'}
            >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <FormField label="Password" htmlFor="password" required={!isPasswordOptional} error={errors.password}>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            required={!isPasswordOptional}
                            autoComplete="new-password"
                            placeholder={isPasswordOptional ? 'Keep current password' : 'Password'}
                            invalid={Boolean(errors.password)}
                        />
                    </FormField>

                    <FormField
                        label="Confirm password"
                        htmlFor="password_confirmation"
                        required={!isPasswordOptional}
                        error={errors.password_confirmation}
                    >
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
                    </FormField>
                </div>
            </FormSection>

            <FormActions sticky>
                <Link href={route('users.index')} className={buttonVariants({ variant: 'secondary' })}>
                    Cancel
                </Link>
                <Button type="submit" isLoading={processing}>
                    {!processing && <Check />}
                    {submitLabel}
                </Button>
            </FormActions>
        </form>
    );
}

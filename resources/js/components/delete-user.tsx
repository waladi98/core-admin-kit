import { Button, FormSection, Input, Label, Modal, ModalFooter } from '@/components/core';
import InputError from '@/components/input-error';
import { useDisclosure } from '@/hooks/use-disclosure';
import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const confirmation = useDisclosure();
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const closeModal = () => {
        confirmation.close();
        clearErrors();
        reset();
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    return (
        <FormSection icon={Trash2} title="Delete account" description="Delete your account and all of its resources.">
            <div className="border-danger/20 bg-danger-soft rounded-field flex flex-col gap-3 border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-danger space-y-0.5">
                    <p className="text-sm font-medium">Warning</p>
                    <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                </div>

                <Button variant="danger" onClick={confirmation.open} className="shrink-0">
                    Delete account
                </Button>
            </div>

            <Modal
                isOpen={confirmation.isOpen}
                onClose={closeModal}
                title="Are you sure you want to delete your account?"
                description="Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password to confirm you would like to permanently delete your account."
            >
                <form onSubmit={deleteUser}>
                    <div className="grid gap-2">
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            invalid={Boolean(errors.password)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <ModalFooter>
                        <Button variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="danger" isLoading={processing}>
                            Delete account
                        </Button>
                    </ModalFooter>
                </form>
            </Modal>
        </FormSection>
    );
}

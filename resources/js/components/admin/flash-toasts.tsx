import { useToast, type ToastType } from '@/components/core';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Turns the server flash (`->withToast($type, $message)` on a redirect) into a toast.
 * Each flash has a unique id, so the same message flashed twice still shows twice.
 */
export function FlashToasts() {
    const { flash } = usePage<SharedData>().props;
    const toast = useToast();
    const flashed = flash?.toast;

    useEffect(() => {
        if (flashed) {
            toast.show(flashed.type as ToastType, flashed.message, flashed.id);
        }
    }, [flashed, toast]);

    return null;
}

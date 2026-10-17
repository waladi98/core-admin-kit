import { FormSection, RadioGroup, type BreadcrumbEntry, type ChoiceOption } from '@/components/core';
import { useAppearance, type Appearance as AppearanceChoice } from '@/hooks/use-appearance';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { __ } from '@/lib/i18n';
import { Head } from '@inertiajs/react';
import { SunMoon } from 'lucide-react';
import { type ReactNode } from 'react';

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Appearance', href: '/settings/appearance' },
];

const appearanceOptions: ChoiceOption[] = [
    { value: 'light', label: 'Light', description: 'Bright background, dark text.' },
    { value: 'dark', label: 'Dark', description: 'Dark background, easier on the eyes in dim rooms.' },
    { value: 'system', label: 'Follow device', description: 'Matches the light or dark setting of this device.' },
];

export default function Appearance() {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <>
            <Head title={__('Appearance')} />

            <FormSection icon={SunMoon} title="Theme" description="Saved on this browser only; other devices keep their own choice.">
                <RadioGroup
                    name="appearance"
                    label="Theme"
                    variant="cards"
                    orientation="horizontal"
                    options={appearanceOptions}
                    value={appearance}
                    onChange={(value) => updateAppearance(value as AppearanceChoice)}
                />
            </FormSection>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
Appearance.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Appearance">
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

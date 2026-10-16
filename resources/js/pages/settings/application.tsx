import { Button, FileUpload, FormActions, FormField, FormSection, Input, type BreadcrumbEntry } from '@/components/core';
import AdminLayout from '@/layouts/admin-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import { Check, Palette, RotateCcw, TriangleAlert } from 'lucide-react';
import { type FormEventHandler, type ReactNode } from 'react';

interface ApplicationSettingsProps {
    settings: { name: string; color: string; logoUrl: string | null };
    defaults: { name: string; color: string };
}

const breadcrumbs: BreadcrumbEntry[] = [
    { title: 'Settings', href: '/settings/profile' },
    { title: 'Application', href: '/settings/application' },
];

/** Same formula as App\Rules\ReadableBrandColor (WCAG contrast with white text). */
function contrastWithWhite(hex: string): number | null {
    if (!/^#[0-9a-f]{6}$/i.test(hex)) {
        return null;
    }

    const [red, green, blue] = [1, 3, 5].map((start) => {
        const value = parseInt(hex.slice(start, start + 2), 16) / 255;

        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });

    return Math.round((1.05 / (0.2126 * red + 0.7152 * green + 0.0722 * blue + 0.05)) * 100) / 100;
}

export default function ApplicationSettings({ settings, defaults }: ApplicationSettingsProps) {
    const { data, setData, post, errors, processing } = useForm<{
        _method: 'patch';
        name: string;
        color: string;
        logo: File | null;
        remove_logo: boolean;
    }>({ _method: 'patch', name: settings.name, color: settings.color, logo: null, remove_logo: false });

    const contrast = contrastWithWhite(data.color);
    const isReadable = contrast !== null && contrast >= 4.5;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        // Files need multipart form data, which PHP only parses on POST; `_method` makes Laravel treat it as PATCH.
        post(route('application.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setData((current) => ({ ...current, logo: null, remove_logo: false })),
        });
    };

    return (
        <>
            <Head title={__('Application settings')} />

            <form onSubmit={submit}>
                <FormSection
                    icon={Palette}
                    title="Branding"
                    description="Name, logo and main color shown to everyone. Changes apply right after saving."
                    actions={
                        <button
                            type="button"
                            onClick={() =>
                                setData((current) => ({ ...current, name: defaults.name, color: defaults.color, remove_logo: true, logo: null }))
                            }
                            className="text-ink-soft hover:text-ink inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4"
                        >
                            <RotateCcw className="size-3.5" />
                            {__('Reset to default')}
                        </button>
                    }
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <FormField
                            label="Application name"
                            htmlFor="name"
                            required
                            hint="Shown in the sidebar and on the login page."
                            error={errors.name}
                        >
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(event) => setData('name', event.target.value)}
                                required
                                invalid={Boolean(errors.name)}
                            />
                        </FormField>

                        <FormField
                            label="Brand color"
                            htmlFor="color"
                            required
                            hint="Used for buttons and highlights. Must stay readable with white text."
                            error={errors.color}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    aria-label={__('Pick a color')}
                                    value={/^#[0-9a-f]{6}$/i.test(data.color) ? data.color : '#000000'}
                                    onChange={(event) => setData('color', event.target.value)}
                                    className="rounded-field border-line h-control w-12 shrink-0 cursor-pointer border p-1"
                                />
                                <Input
                                    id="color"
                                    value={data.color}
                                    onChange={(event) => setData('color', event.target.value.trim())}
                                    maxLength={7}
                                    invalid={Boolean(errors.color) || (contrast !== null && !isReadable)}
                                    className="font-mono uppercase"
                                />
                            </div>
                        </FormField>

                        <FormField label="Preview" htmlFor="preview">
                            <div id="preview" className="flex flex-wrap items-center gap-2">
                                <span
                                    className="rounded-field h-control text-brand-foreground inline-flex items-center px-3.5 text-sm font-medium"
                                    style={{ backgroundColor: /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : undefined }}
                                >
                                    {__('Save')}
                                </span>
                                {contrast !== null && (
                                    <span className={cn('inline-flex items-center gap-1 text-xs', isReadable ? 'text-success' : 'text-danger')}>
                                        {isReadable ? <Check className="size-3.5" /> : <TriangleAlert className="size-3.5" />}
                                        {__('Contrast :ratio:1', { ratio: contrast })}
                                    </span>
                                )}
                            </div>
                        </FormField>

                        <FormField
                            label="Logo"
                            htmlFor="logo"
                            hint="PNG, JPG, WebP or SVG, up to 1 MB. Square images look best."
                            error={errors.logo}
                            className="md:col-span-2"
                        >
                            <FileUpload
                                id="logo"
                                value={data.logo}
                                onChange={(file) => setData((current) => ({ ...current, logo: file, remove_logo: false }))}
                                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                maxSizeMb={1}
                                invalid={Boolean(errors.logo)}
                            />
                            {settings.logoUrl && !data.logo && !data.remove_logo && (
                                <div className="mt-1 flex items-center gap-3">
                                    <img src={settings.logoUrl} alt="" className="size-10 rounded-md object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => setData('remove_logo', true)}
                                        className="text-danger text-xs font-medium underline underline-offset-4"
                                    >
                                        {__('Remove logo')}
                                    </button>
                                </div>
                            )}
                        </FormField>
                    </div>

                    <FormActions className="border-line mt-4 border-t pt-4">
                        <Button type="submit" isLoading={processing}>
                            {!processing && <Check />}
                            {__('Save')}
                        </Button>
                    </FormActions>
                </FormSection>
            </form>
        </>
    );
}

/** Persistent layout: the shell stays mounted while navigating between pages. */
ApplicationSettings.layout = (page: ReactNode) => (
    <AdminLayout breadcrumbs={breadcrumbs} title="Application settings">
        <SettingsLayout>{page}</SettingsLayout>
    </AdminLayout>
);

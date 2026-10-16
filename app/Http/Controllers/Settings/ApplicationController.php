<?php

namespace App\Http\Controllers\Settings;

use App\Enums\Permission;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ApplicationSettingsRequest;
use App\Support\AppSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Settings → Application: name, logo and brand color.
 */
class ApplicationController extends Controller
{
    public function edit(): Response
    {
        Gate::authorize(Permission::SettingsManage->value);

        return Inertia::render('settings/application', [
            'settings' => AppSettings::branding(),
            'defaults' => ['name' => config('branding.name'), 'color' => config('branding.color')],
        ]);
    }

    public function update(ApplicationSettingsRequest $request): RedirectResponse
    {
        $values = ['name' => $request->validated('name'), 'color' => strtolower($request->validated('color'))];
        $currentLogo = AppSettings::get('logo_path');

        if ($request->hasFile('logo') || $request->boolean('remove_logo')) {
            if ($currentLogo) {
                Storage::disk('public')->delete($currentLogo);
            }

            $values['logo_path'] = $request->hasFile('logo') ? $request->file('logo')->store('branding', 'public') : null;
        }

        AppSettings::set($values);

        return to_route('application.edit')->withToast('success', __('Application settings saved.'));
    }
}

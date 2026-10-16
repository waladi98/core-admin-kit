<?php

/*
|--------------------------------------------------------------------------
| Branding defaults
|--------------------------------------------------------------------------
|
| Used until an administrator changes them on Settings → Application
| (stored in the `settings` table, read through App\Support\AppSettings).
|
*/

return [

    // Shown in the sidebar, on the login page and in emails.
    'name' => env('APP_NAME', 'Finance Core'),

    // Main color for buttons, active menu items and highlights. Must stay readable with white text.
    'color' => env('BRAND_COLOR', '#1f2937'),

    // Path on the "public" disk, or null to show the default icon.
    'logo_path' => null,

];

<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// The app starts at the dashboard; guests are sent to the login page by the auth middleware.
Route::redirect('/', '/dashboard')->name('home');

Route::post('locale', LocaleController::class)->name('locale.update');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::resource('users', UserController::class)->except('show');
    Route::resource('roles', RoleController::class)->except('show');

    // Component catalog for developers (resources/js/pages/ui.tsx). Only available locally.
    if (app()->environment('local')) {
        Route::inertia('ui', 'ui')->name('ui');
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

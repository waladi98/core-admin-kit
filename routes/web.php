<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\Support\AboutController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VendorController;
use Illuminate\Support\Facades\Route;

// The app starts at the dashboard; guests are sent to the login page by the auth middleware.
Route::redirect('/', '/dashboard')->name('home');

Route::post('locale', LocaleController::class)->name('locale.update');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('users/export', [UserController::class, 'export'])->name('users.export');
    Route::post('users/bulk', [UserController::class, 'bulk'])->name('users.bulk');
    Route::resource('users', UserController::class)->except('show');
    Route::resource('roles', RoleController::class)->except('show');
    Route::get('activity', [ActivityLogController::class, 'index'])->name('activity.index');

    // Vendors: quick add/edit in a modal on the list, full edit and details on their own pages.
    Route::patch('vendors/{vendor}/quick', [VendorController::class, 'quickUpdate'])->name('vendors.quick-update');
    Route::patch('vendors/{vendor}/status', [VendorController::class, 'toggleStatus'])->name('vendors.toggle-status');
    Route::resource('vendors', VendorController::class)->except('create');

    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');

    // Icons, styling and packages of the starter kit. Admins only.
    Route::get('support/about', AboutController::class)->name('support.about');

    // Component catalog for developers (resources/js/pages/ui.tsx). Only available locally.
    if (app()->environment('local')) {
        Route::inertia('ui', 'ui')->name('ui');
    }
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

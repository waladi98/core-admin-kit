<?php

namespace App\Console\Commands;

use App\Actions\SyncPermissions;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Prepares a fresh checkout (run through `composer setup`). Safe to run again:
 * it never replaces an existing APP_KEY and only seeds an empty database.
 */
class InstallCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:install {--demo : Also seed 100 sample users and 25 sample vendors}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up the application: app key, database, roles & permissions, admin account and storage link';

    /**
     * Execute the console command.
     */
    public function handle(SyncPermissions $syncPermissions): int
    {
        if (blank(config('app.key'))) {
            $this->call('key:generate', ['--force' => true]);
        } else {
            $this->components->info('APP_KEY already set, keeping it.');
        }

        $this->call('migrate', ['--force' => true]);

        $syncPermissions();
        $this->components->info('Roles and permissions are in sync.');

        if (User::query()->doesntExist()) {
            $this->call('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true]);
            $this->components->info('Admin account: admin@example.com / password (change it after signing in).');
        } else {
            $this->components->info('Users already exist, skipping seeding.');
        }

        if ($this->option('demo')) {
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\UserSeeder', '--force' => true]);
            $this->call('db:seed', ['--class' => 'Database\\Seeders\\VendorSeeder', '--force' => true]);
        }

        if (! File::exists(public_path('storage'))) {
            $this->call('storage:link');
        }

        $this->components->info('Finance Core is ready. Run `composer dev` and open the app.');

        return self::SUCCESS;
    }
}

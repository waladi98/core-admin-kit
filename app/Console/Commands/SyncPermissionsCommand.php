<?php

namespace App\Console\Commands;

use App\Actions\SyncPermissions;
use Illuminate\Console\Command;

class SyncPermissionsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create permissions from App\Enums\Permission and the built-in roles (admin, manager, staff)';

    /**
     * Execute the console command.
     */
    public function handle(SyncPermissions $syncPermissions): int
    {
        $syncPermissions();

        $this->components->info('Permissions and built-in roles are in sync.');

        return self::SUCCESS;
    }
}

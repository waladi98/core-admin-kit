<?php

namespace App\Console\Commands;

use App\Support\ModuleGenerator\ModuleBlueprint;
use App\Support\ModuleGenerator\ModuleField;
use App\Support\ModuleGenerator\ModuleGenerator;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use InvalidArgumentException;
use RuntimeException;

use function Laravel\Prompts\confirm;
use function Laravel\Prompts\select;
use function Laravel\Prompts\text;

/**
 * Generates a complete CRUD module (database, permissions, pages, menu, tests) that follows
 * the Users (page) or Vendors (mixed) reference modules. See Support → About template → Generator.
 */
class MakeModuleCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:module
        {name? : Singular module name, e.g. Client or ProductCategory}
        {--pattern= : page (add/edit on pages, like Users) or mixed (modal + pages, like Vendors)}
        {--fields= : Fields as "name:string, email:email?, credit_limit:currency, kind:select(a,b)"}
        {--group= : Sidebar menu group (created when it does not exist)}
        {--icon= : Lucide icon name, e.g. Briefcase}
        {--dry-run : Show the files without writing anything}
        {--no-format : Skip Pint and Prettier on the generated files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a CRUD module: migration, model, permissions, controller, pages, menu entry and tests';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            $blueprint = $this->blueprint();
        } catch (InvalidArgumentException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $generator = new ModuleGenerator($blueprint, base_path());

        if ($problems = $generator->problems()) {
            $this->components->error("Cannot create the {$blueprint->model} module:");
            $this->components->bulletList($problems);

            return self::FAILURE;
        }

        $this->components->twoColumnDetail('<fg=gray>Module</>', "{$blueprint->model} ({$blueprint->pattern}) → /{$blueprint->slug}");
        $this->components->twoColumnDetail('<fg=gray>Fields</>', implode(', ', array_map(fn (ModuleField $field): string => $field->name.':'.$field->type.($field->isRequired ? '' : '?'), $blueprint->fields)));
        $this->components->twoColumnDetail('<fg=gray>Menu</>', "{$blueprint->menuGroup} → {$blueprint->titlePlural()} ({$blueprint->icon})");

        if ($this->option('dry-run')) {
            $this->newLine();
            $this->components->info('Dry run: these files would be created');
            $this->components->bulletList(array_keys($generator->plannedFiles()));
            $this->components->info('and these files would be updated');
            $this->components->bulletList($generator->sharedFiles());

            return self::SUCCESS;
        }

        try {
            $created = $generator->generate();
        } catch (RuntimeException $exception) {
            $this->components->error($exception->getMessage());

            return self::FAILURE;
        }

        $added = $generator->addTranslations();

        $this->newLine();
        $this->components->info("Module {$blueprint->model} created.");
        $this->components->bulletList([...$created, ...array_map(fn (string $file): string => "{$file} (updated)", $generator->sharedFiles())]);

        if (! $this->option('no-format')) {
            $this->format($created);
        }

        $this->components->info('Next steps');
        $this->components->bulletList([
            'php artisan migrate',
            'php artisan app:sync-permissions (creates the '.$blueprint->slug.'.* permissions; only admins have them until you tick them for other roles on Roles & Permissions)',
            "php artisan db:seed --class={$blueprint->model}Seeder (optional sample data)",
            'Translate the new texts in lang/id.json ('.count($added).' added with the English text as a placeholder)',
            "php artisan test --compact tests/Feature/{$blueprint->model}ManagementTest.php (local: composer test:local)",
            'npm run dev, then open /'.$blueprint->slug,
        ]);

        return self::SUCCESS;
    }

    private function blueprint(): ModuleBlueprint
    {
        $isInteractive = $this->input->isInteractive() && ! $this->option('fields');

        $name = $this->argument('name') ?? ($isInteractive ? text('Module name (singular)', placeholder: 'Client', required: true, hint: 'e.g. Client, ProductCategory') : null);

        if (blank($name)) {
            throw new InvalidArgumentException('Give the module name, e.g. php artisan make:module Client --fields="name:string".');
        }

        $pattern = $this->option('pattern') ?? ($isInteractive
            ? select('Form pattern', ModuleBlueprint::PATTERNS, default: 'mixed')
            : 'page');

        $fields = $this->option('fields')
            ? ModuleField::parseList((string) $this->option('fields'))
            : ($isInteractive ? $this->askFields() : throw new InvalidArgumentException('Give the fields with --fields="name:string, …".'));

        $group = $this->option('group') ?? ($isInteractive ? text('Sidebar menu group', default: 'Master Data', required: true) : 'Master Data');
        $icon = $this->option('icon') ?? ($isInteractive ? text('Menu icon (Lucide name)', default: 'Folder', required: true, hint: 'See lucide.dev/icons or Support → About template → Icons') : 'Folder');

        return new ModuleBlueprint($name, $fields, $pattern, $group, $icon);
    }

    /**
     * @return list<ModuleField>
     */
    private function askFields(): array
    {
        $this->components->info('Fields: name:type, add ? for optional. Types: '.implode(', ', array_keys(ModuleField::TYPES)).'.');

        $fields = [];

        do {
            $definition = text(
                count($fields) === 0 ? 'First field (the record title)' : 'Next field',
                placeholder: count($fields) === 0 ? 'name:string' : 'email:email?',
                required: count($fields) === 0,
                validate: function (string $value): ?string {
                    try {
                        ModuleField::parse($value);

                        return null;
                    } catch (InvalidArgumentException $exception) {
                        return $exception->getMessage();
                    }
                },
            );

            $fields[] = ModuleField::parse($definition);
        } while (confirm('Add another field?', default: true));

        return $fields;
    }

    /**
     * Runs Pint and Prettier on the generated and updated files.
     *
     * @param  list<string>  $files
     */
    private function format(array $files): void
    {
        $quote = fn (string $file): string => '"'.base_path($file).'"';
        $php = array_values(array_filter($files, fn (string $file): bool => str_ends_with($file, '.php')));
        $frontend = [...array_values(array_filter($files, fn (string $file): bool => str_ends_with($file, '.ts') || str_ends_with($file, '.tsx'))), 'resources/js/config/navigation.ts', 'resources/js/config/commands.ts'];

        $pint = Process::path(base_path())->timeout(120)->run(PHP_BINARY.' vendor/bin/pint '.implode(' ', array_map($quote, [...$php, 'app/Enums/Permission.php'])));
        $prettier = Process::path(base_path())->timeout(180)->run('npx prettier --write '.implode(' ', array_map($quote, $frontend)));

        $pint->successful() && $prettier->successful()
            ? $this->components->info('Formatted with Pint and Prettier.')
            : $this->components->warn('Formatting did not finish; run vendor/bin/pint and npm run format yourself.');
    }
}

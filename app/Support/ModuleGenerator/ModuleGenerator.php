<?php

namespace App\Support\ModuleGenerator;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Writes a module from the stubs in stubs/module and registers it in the shared files
 * (permissions, menu, command palette, translations).
 *
 * Shared files are changed only at `@module-generator:*` markers, so the rest of each file
 * stays exactly as written by hand.
 */
class ModuleGenerator
{
    /** @var list<string> */
    private array $translationKeys = [];

    public function __construct(
        private readonly ModuleBlueprint $blueprint,
        private readonly string $basePath,
    ) {}

    /**
     * Files the module creates, relative to the project root, mapped to the stub that renders them.
     *
     * @return array<string, string>
     */
    public function plannedFiles(): array
    {
        $b = $this->blueprint;
        $mixed = $b->isMixed();

        $files = [
            'database/migrations/'.date('Y_m_d_His')."_create_{$b->table}_table.php" => 'migration',
            "app/Models/{$b->model}.php" => 'model',
            "database/factories/{$b->model}Factory.php" => 'factory',
            "database/seeders/{$b->model}Seeder.php" => 'seeder',
            "app/Policies/{$b->model}Policy.php" => 'policy',
            "app/Http/Requests/{$b->model}IndexRequest.php" => 'index-request',
            'app/Http/Requests/'.($mixed ? "Quick{$b->model}Request" : "Store{$b->model}Request").'.php' => 'store-request',
            "app/Http/Requests/Update{$b->model}Request.php" => 'update-request',
            "app/Http/Controllers/{$b->model}Controller.php" => $mixed ? 'controller.mixed' : 'controller.page',
            "routes/modules/{$b->slug}.php" => $mixed ? 'routes.mixed' : 'routes.page',
            "resources/js/types/{$b->slugSingular}.ts" => 'types',
            "resources/js/pages/{$b->slug}/index.tsx" => 'index',
            "resources/js/components/admin/{$b->slugSingular}-form.tsx" => 'form',
            "resources/js/pages/{$b->slug}/edit.tsx" => 'edit',
            "tests/Feature/{$b->model}ManagementTest.php" => $mixed ? 'test.mixed' : 'test.page',
        ];

        if ($mixed) {
            $files["resources/js/components/admin/{$b->slugSingular}-quick-form.tsx"] = 'quick-form';
            $files["resources/js/pages/{$b->slug}/show.tsx"] = 'show';
        } else {
            $files["resources/js/pages/{$b->slug}/create.tsx"] = 'create';
        }

        foreach ($b->selectFields() as $field) {
            $files['app/Enums/'.$field->enumClass($b->model).'.php'] = 'enum:'.$field->name;
        }

        return $files;
    }

    /**
     * Shared files the module is registered in.
     *
     * @return list<string>
     */
    public function sharedFiles(): array
    {
        return ['app/Enums/Permission.php', 'resources/js/config/navigation.ts', 'resources/js/config/commands.ts', 'lang/id.json'];
    }

    /**
     * Reasons the module cannot be generated (it already exists, a marker is missing…).
     *
     * @return list<string>
     */
    public function problems(): array
    {
        $b = $this->blueprint;
        $problems = [];

        foreach ([$this->path("app/Models/{$b->model}.php"), $this->path("resources/js/pages/{$b->slug}"), $this->path("routes/modules/{$b->slug}.php")] as $existing) {
            if (File::exists($existing)) {
                $problems[] = 'Already exists: '.$this->relative($existing);
            }
        }

        if (File::exists($this->path('routes/web.php')) && preg_match("/['\"]{$b->slug}['\"]/", File::get($this->path('routes/web.php')))) {
            $problems[] = "routes/web.php already has routes for \"{$b->slug}\".";
        }

        $markers = [
            'app/Enums/Permission.php' => ['@module-generator:cases', '@module-generator:labels', '@module-generator:groups'],
            'resources/js/config/navigation.ts' => ['@module-generator:groups'],
            'resources/js/config/commands.ts' => ['@module-generator:quick-actions'],
        ];

        foreach ($markers as $file => $names) {
            $contents = File::exists($this->path($file)) ? File::get($this->path($file)) : '';

            foreach ($names as $name) {
                if (! str_contains($contents, $name)) {
                    $problems[] = "Marker \"// {$name}\" is missing in {$file}.";
                }
            }
        }

        if (str_contains(File::exists($this->path('app/Enums/Permission.php')) ? File::get($this->path('app/Enums/Permission.php')) : '', "case {$b->modelPlural}View ")) {
            $problems[] = "Permission {$b->modelPlural}View already exists.";
        }

        return $problems;
    }

    /**
     * Writes the module. Returns the created files.
     *
     * @return list<string>
     */
    public function generate(): array
    {
        if ($problems = $this->problems()) {
            throw new RuntimeException(implode("\n", $problems));
        }

        $created = [];

        foreach ($this->plannedFiles() as $file => $stub) {
            $contents = $this->render($stub);
            File::ensureDirectoryExists(dirname($this->path($file)));
            File::put($this->path($file), $contents);
            $this->collectTranslationKeys($contents);
            $created[] = $file;
        }

        $this->registerPermissions();
        $this->registerMenu();
        $this->registerQuickAction();

        return $created;
    }

    /**
     * Adds the module's English texts to lang/id.json (value = English, to be translated).
     *
     * @return list<string> The keys that were added.
     */
    public function addTranslations(): array
    {
        $path = $this->path('lang/id.json');
        $dictionary = File::exists($path) ? (json_decode(File::get($path), true) ?? []) : [];
        $added = [];

        foreach (array_unique($this->translationKeys) as $key) {
            if (! array_key_exists($key, $dictionary)) {
                $dictionary[$key] = $key;
                $added[] = $key;
            }
        }

        ksort($dictionary, SORT_STRING | SORT_FLAG_CASE);
        File::put($path, json_encode($dictionary, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)."\n");

        return $added;
    }

    private function render(string $stub): string
    {
        $tokens = $this->tokens();

        if (str_starts_with($stub, 'enum:')) {
            $field = collect($this->blueprint->selectFields())->firstWhere('name', substr($stub, 5));
            $tokens = [
                ...$tokens,
                'enumClass' => $field->enumClass($this->blueprint->model),
                'enumCases' => implode("\n    ", array_map(fn (string $value): string => 'case '.Str::studly($value)." = '{$value}';", $field->options)),
                'enumLabels' => implode("\n            ", array_map(fn (string $value): string => 'self::'.Str::studly($value)." => __('".Str::ucfirst(str_replace('_', ' ', $value))."'),", $field->options)),
            ];
            $stub = 'enum';
        }

        $contents = File::get($this->stubPath($stub));

        // {{#if name}} … {{/if}} blocks (not nested).
        $contents = preg_replace_callback('/^\{\{#if (\w+)\}\}\n(.*?)^\{\{\/if\}\}\n/ms', fn (array $match): string => ($tokens[$match[1]] ?? '') === '1' ? $match[2] : '', $contents);

        return preg_replace_callback('/\{\{ (\w+) \}\}/', function (array $match) use ($tokens, $stub): string {
            if (! array_key_exists($match[1], $tokens)) {
                throw new RuntimeException("Unknown placeholder {{ {$match[1]} }} in {$stub}.stub.");
            }

            return $tokens[$match[1]];
        }, $contents);
    }

    /**
     * @return array<string, string>
     */
    private function tokens(): array
    {
        $b = $this->blueprint;
        $tokens = $b->tokens();
        $filter = $b->selectFields()[0] ?? null;
        $mixed = $b->isMixed();
        $storeFields = $mixed ? $b->quickFields() : $b->fields;

        return [
            ...$tokens,
            'mixed' => $mixed ? '1' : '',
            'page' => $mixed ? '' : '1',
            'hasFilter' => $filter ? '1' : '',
            'hasRowActions' => $mixed ? 'true' : 'canEdit || canDelete',
            'filterField' => $filter->name ?? '',
            'filterFieldCamel' => $filter?->camel() ?? '',
            'filterFieldLabel' => $filter?->label() ?? '',
            'tsFilterType' => implode('', array_map(fn (ModuleField $field): string => "; {$field->name}: string | null", $b->selectFields())),
            'tsFilterInitial' => implode('', array_map(fn (ModuleField $field): string => ", {$field->name}: filters.{$field->camel()}", $b->selectFields())),
            'recordHref' => $mixed ? "route('{$b->slug}.show', record.id)" : "route('{$b->slug}.index')",
            'storeRequestClass' => $mixed ? "Quick{$b->model}Request" : "Store{$b->model}Request",
            'storeRequestPurpose' => $mixed ? 'The fields of the quick add / quick edit modal on the list.' : 'Every field of the create form.',
            'storeRules' => $mixed
                ? $tokens['quickRules']
                : $tokens['rules']."\n            'status' => ['required', Rule::enum(\\App\\Enums\\RecordStatus::class)],",
            'quickFormControls' => $mixed ? $tokens['quickFormControls'] : '',
            'testQuickPayload' => $tokens['testQuickPayload'],
            'storeFieldsCount' => (string) count($storeFields),
        ];
    }

    private function registerPermissions(): void
    {
        $b = $this->blueprint;
        $path = $this->path('app/Enums/Permission.php');
        $contents = File::get($path);
        $cases = ['View' => 'view', 'Create' => 'create', 'Update' => 'update', 'Delete' => 'delete'];
        $labels = ['View' => 'View', 'Create' => 'Create', 'Update' => 'Edit', 'Delete' => 'Delete'];

        $caseLines = implode('', array_map(fn (string $suffix, string $action): string => "    case {$b->modelPlural}{$suffix} = '{$b->slug}.{$action}';\n", array_keys($cases), $cases));
        $labelLines = implode('', array_map(fn (string $suffix): string => "            self::{$b->modelPlural}{$suffix} => __('{$labels[$suffix]} ".Str::lower($b->titlePlural())."'),\n", array_keys($cases)));
        $groupLine = '            '.implode(', ', array_map(fn (string $suffix): string => "self::{$b->modelPlural}{$suffix}", array_keys($cases)))." => __('{$b->titlePlural()}'),\n";

        $contents = $this->insertBeforeMarker($contents, '@module-generator:cases', $caseLines);
        $contents = $this->insertBeforeMarker($contents, '@module-generator:labels', $labelLines);
        $contents = $this->insertBeforeMarker($contents, '@module-generator:groups', $groupLine);

        File::put($path, $contents);

        foreach ($labels as $label) {
            $this->translationKeys[] = "{$label} ".Str::lower($b->titlePlural());
        }
        $this->translationKeys[] = $b->titlePlural();
    }

    private function registerMenu(): void
    {
        $b = $this->blueprint;
        $path = $this->path('resources/js/config/navigation.ts');
        $contents = $this->addIconImport(File::get($path), $b->icon);
        $item = "{ title: '{$b->titlePlural()}', icon: {$b->icon}, href: '/{$b->slug}', permission: '{$b->slug}.view' }";
        $groupLabel = str_replace("'", "\\'", $b->menuGroup);

        $groupPosition = strpos($contents, "label: '{$groupLabel}',");

        if ($groupPosition !== false && ($itemsPosition = strpos($contents, 'items: [', $groupPosition)) !== false) {
            $closing = $this->matchingBracket($contents, $itemsPosition + strlen('items: '));
            $before = rtrim(substr($contents, 0, $closing));
            $separator = str_ends_with($before, '[') || str_ends_with($before, ',') ? ' ' : ', ';
            $contents = $before.$separator.$item.substr($contents, $closing);
        } else {
            $group = "{\n        label: '{$groupLabel}',\n        items: [{$item}],\n    },\n    ";
            $contents = $this->insertBeforeMarker($contents, '@module-generator:groups', $group, inline: true);
            $this->translationKeys[] = $b->menuGroup;
        }

        File::put($path, $contents);
    }

    private function registerQuickAction(): void
    {
        $b = $this->blueprint;
        $path = $this->path('resources/js/config/commands.ts');
        $contents = $this->addIconImport(File::get($path), $b->icon);
        $href = $b->isMixed() ? "/{$b->slug}?create=1" : "/{$b->slug}/create";
        $line = "    { title: 'Add {$b->tokens()['title']}', href: '{$href}', icon: {$b->icon}, permission: '{$b->slug}.create', keywords: ['new', 'baru', 'tambah'] },\n";

        File::put($path, $this->insertBeforeMarker($contents, '@module-generator:quick-actions', $line));
        $this->translationKeys[] = "Add {$b->tokens()['title']}";
    }

    /** Inserts text on the line(s) right before the marker comment. */
    private function insertBeforeMarker(string $contents, string $marker, string $text, bool $inline = false): string
    {
        $position = strpos($contents, "// {$marker}");

        if ($position === false) {
            throw new RuntimeException("Marker {$marker} not found.");
        }

        if ($inline) {
            return substr($contents, 0, $position).$text.substr($contents, $position);
        }

        $lineStart = strrpos(substr($contents, 0, $position), "\n") + 1;

        return substr($contents, 0, $lineStart).$text.substr($contents, $lineStart);
    }

    /** Adds an icon to the `import { … } from 'lucide-react'` line of a file. */
    private function addIconImport(string $contents, string $icon): string
    {
        return preg_replace_callback("/import \{([^}]*)\} from 'lucide-react';/", function (array $match) use ($icon): string {
            $names = array_map('trim', explode(',', $match[1]));

            if (! in_array($icon, $names, true)) {
                $names[] = $icon;
            }

            return 'import { '.implode(', ', array_filter($names)).' } from \'lucide-react\';';
        }, $contents, 1);
    }

    /** Position of the `]` that closes the `[` at $openPosition (strings are skipped). */
    private function matchingBracket(string $contents, int $openPosition): int
    {
        $depth = 0;
        $quote = null;

        for ($i = $openPosition, $length = strlen($contents); $i < $length; $i++) {
            $char = $contents[$i];

            if ($quote !== null) {
                if ($char === '\\') {
                    $i++;
                } elseif ($char === $quote) {
                    $quote = null;
                }

                continue;
            }

            if ($char === "'" || $char === '"' || $char === '`') {
                $quote = $char;
            } elseif ($char === '[') {
                $depth++;
            } elseif ($char === ']' && --$depth === 0) {
                return $i;
            }
        }

        throw new RuntimeException('Could not find the end of the menu group items.');
    }

    /** Collects texts that are translated at runtime (same rules as the Indonesian dictionary check). */
    private function collectTranslationKeys(string $contents): void
    {
        $patterns = [
            "/\\b(?:__|t)\\(\\s*'((?:[^'\\\\]|\\\\.)+)'/",
            '/\b(?:title|description|label|hint|emptyMessage|submitLabel|header|confirmLabel)="([^"{}]+)"/',
            "/\\b(?:title|label|header|confirmLabel):\\s*'((?:[^'\\\\]|\\\\.)+)'/",
            "/\\b(?:title|description)=\\{[^}?]*\\?\\s*'((?:[^'\\\\]|\\\\.)+)'\\s*:\\s*'((?:[^'\\\\]|\\\\.)+)'\\s*\\}/",
        ];

        foreach ($patterns as $pattern) {
            preg_match_all($pattern, $contents, $matches, PREG_SET_ORDER);

            foreach ($matches as $match) {
                foreach (array_slice($match, 1) as $value) {
                    if ($value !== '' && preg_match('/[A-Za-z]/', $value) && ! str_starts_with($value, '@/') && ! preg_match('/^[a-z_.-]+$/', $value)) {
                        $this->translationKeys[] = str_replace("\\'", "'", $value);
                    }
                }
            }
        }
    }

    private function stubPath(string $stub): string
    {
        $custom = $this->path("stubs/module/{$stub}.stub");

        return File::exists($custom) ? $custom : base_path("stubs/module/{$stub}.stub");
    }

    private function path(string $relative): string
    {
        return rtrim($this->basePath, '/\\').'/'.$relative;
    }

    private function relative(string $path): string
    {
        return ltrim(str_replace(rtrim($this->basePath, '/\\'), '', $path), '/\\');
    }
}

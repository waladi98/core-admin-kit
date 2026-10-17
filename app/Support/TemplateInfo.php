<?php

namespace App\Support;

use Illuminate\Support\Facades\File;

/**
 * Facts about the starter kit for Support → About template: installed package versions
 * (read from the lock files, so they always match what is installed) and the Lucide icons
 * the code imports.
 */
class TemplateInfo
{
    /**
     * Packages shown on the page, grouped by area. Purpose texts are English (translated on the page).
     *
     * @var list<array{name: string, source: 'composer'|'npm', area: string, purpose: string, docs: string}>
     */
    private const PACKAGES = [
        ['name' => 'laravel/framework', 'source' => 'composer', 'area' => 'Backend', 'purpose' => 'PHP framework: routing, database, queues, mail', 'docs' => 'https://laravel.com/docs'],
        ['name' => 'inertiajs/inertia-laravel', 'source' => 'composer', 'area' => 'Backend', 'purpose' => 'Connects Laravel controllers to React pages', 'docs' => 'https://inertiajs.com'],
        ['name' => 'spatie/laravel-permission', 'source' => 'composer', 'area' => 'Backend', 'purpose' => 'Roles and permissions', 'docs' => 'https://spatie.be/docs/laravel-permission'],
        ['name' => 'laravel/fortify', 'source' => 'composer', 'area' => 'Backend', 'purpose' => 'Two-factor authentication', 'docs' => 'https://laravel.com/docs/fortify'],
        ['name' => 'tightenco/ziggy', 'source' => 'composer', 'area' => 'Backend', 'purpose' => 'Laravel route names in JavaScript (route())', 'docs' => 'https://github.com/tighten/ziggy'],
        ['name' => 'react', 'source' => 'npm', 'area' => 'Frontend', 'purpose' => 'User interface library', 'docs' => 'https://react.dev'],
        ['name' => '@inertiajs/react', 'source' => 'npm', 'area' => 'Frontend', 'purpose' => 'Inertia adapter for React (pages, forms, links)', 'docs' => 'https://inertiajs.com'],
        ['name' => 'typescript', 'source' => 'npm', 'area' => 'Frontend', 'purpose' => 'Typed JavaScript', 'docs' => 'https://www.typescriptlang.org/docs'],
        ['name' => 'tailwindcss', 'source' => 'npm', 'area' => 'Styling', 'purpose' => 'Utility-first CSS with the Finance Core design tokens', 'docs' => 'https://tailwindcss.com/docs'],
        ['name' => 'class-variance-authority', 'source' => 'npm', 'area' => 'Styling', 'purpose' => 'Component variants (variant, size)', 'docs' => 'https://cva.style/docs'],
        ['name' => 'tailwind-merge', 'source' => 'npm', 'area' => 'Styling', 'purpose' => 'Merges class names without conflicts (cn())', 'docs' => 'https://github.com/dcastil/tailwind-merge'],
        ['name' => '@headlessui/react', 'source' => 'npm', 'area' => 'Styling', 'purpose' => 'Accessible menus, dialogs and drawers (used inside core components only)', 'docs' => 'https://headlessui.com'],
        ['name' => 'lucide-react', 'source' => 'npm', 'area' => 'Styling', 'purpose' => 'Icons', 'docs' => 'https://lucide.dev/icons'],
        ['name' => 'recharts', 'source' => 'npm', 'area' => 'Frontend', 'purpose' => 'Charts', 'docs' => 'https://recharts.org'],
        ['name' => 'vite', 'source' => 'npm', 'area' => 'Tooling', 'purpose' => 'Frontend build and dev server', 'docs' => 'https://vite.dev/guide'],
        ['name' => 'pestphp/pest', 'source' => 'composer', 'area' => 'Tooling', 'purpose' => 'PHP tests', 'docs' => 'https://pestphp.com/docs'],
        ['name' => 'laravel/pint', 'source' => 'composer', 'area' => 'Tooling', 'purpose' => 'PHP code style', 'docs' => 'https://laravel.com/docs/pint'],
    ];

    /**
     * @return list<array{name: string, version: string|null, area: string, purpose: string, docs: string}>
     */
    public static function packages(): array
    {
        $composer = self::composerVersions();
        $npm = self::npmVersions();

        return array_map(fn (array $package): array => [
            'name' => $package['name'],
            'version' => $package['source'] === 'composer' ? ($composer[$package['name']] ?? null) : ($npm[$package['name']] ?? null),
            'area' => $package['area'],
            'purpose' => $package['purpose'],
            'docs' => $package['docs'],
        ], self::PACKAGES);
    }

    /**
     * Names of the Lucide icons imported anywhere in resources/js, sorted.
     *
     * @return list<string>
     */
    public static function icons(): array
    {
        $icons = [];

        foreach (File::allFiles(resource_path('js')) as $file) {
            $contents = $file->getContents();

            if (! preg_match_all("/import\s*\{([^}]*)\}\s*from\s*'lucide-react'/", $contents, $matches)) {
                continue;
            }

            foreach ($matches[1] as $names) {
                foreach (explode(',', $names) as $name) {
                    $name = trim($name);

                    if ($name !== '' && ! str_starts_with($name, 'type ')) {
                        $icons[trim(explode(' as ', $name)[0])] = true;
                    }
                }
            }
        }

        $names = array_keys($icons);
        sort($names);

        return $names;
    }

    /**
     * @return array<string, string>
     */
    private static function composerVersions(): array
    {
        $lock = json_decode((string) @file_get_contents(base_path('composer.lock')), true) ?? [];

        return collect([...($lock['packages'] ?? []), ...($lock['packages-dev'] ?? [])])
            ->mapWithKeys(fn (array $package): array => [$package['name'] => ltrim($package['version'], 'v')])
            ->all();
    }

    /**
     * @return array<string, string>
     */
    private static function npmVersions(): array
    {
        $lock = json_decode((string) @file_get_contents(base_path('package-lock.json')), true) ?? [];

        return collect($lock['packages'] ?? [])
            ->filter(fn (array $package, string $path): bool => str_starts_with($path, 'node_modules/') && substr_count($path, 'node_modules/') === 1 && isset($package['version']))
            ->mapWithKeys(fn (array $package, string $path): array => [substr($path, strlen('node_modules/')) => $package['version']])
            ->all();
    }
}

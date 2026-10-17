<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Support\ModuleGenerator\ModuleBlueprint;
use App\Support\ModuleGenerator\ModuleField;
use App\Support\TemplateInfo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Support → About template: the icons, styling, packages and module generator of the starter kit. Admins only.
 */
class AboutController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->hasRole(Role::ADMIN), 403);

        return Inertia::render('support/about', [
            'packages' => TemplateInfo::packages(),
            'icons' => TemplateInfo::icons(),
            'generator' => [
                'types' => collect(ModuleField::TYPES)->map(fn (array $type, string $name): array => ['name' => $name, ...$type])->values()->all(),
                'patterns' => collect(ModuleBlueprint::PATTERNS)->map(fn (string $description, string $name): array => ['name' => $name, 'description' => $description])->values()->all(),
            ],
        ]);
    }
}

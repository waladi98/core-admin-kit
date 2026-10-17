<?php

namespace App\Http\Controllers\Support;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Support\TemplateInfo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Support → About template: the icons, styling and packages the starter kit uses. Admins only.
 */
class AboutController extends Controller
{
    public function __invoke(Request $request): Response
    {
        abort_unless($request->user()->hasRole(Role::ADMIN), 403);

        return Inertia::render('support/about', [
            'packages' => TemplateInfo::packages(),
            'icons' => TemplateInfo::icons(),
        ]);
    }
}

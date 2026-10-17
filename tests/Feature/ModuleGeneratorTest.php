<?php

use App\Support\ModuleGenerator\ModuleBlueprint;
use App\Support\ModuleGenerator\ModuleField;
use App\Support\ModuleGenerator\ModuleGenerator;
use Illuminate\Support\Facades\File;

/**
 * Copies the shared files the generator edits into a temporary project folder.
 */
function moduleSandbox(): string
{
    $sandbox = storage_path('framework/testing/module-generator-'.uniqid());

    foreach (['app/Enums/Permission.php', 'resources/js/config/navigation.ts', 'resources/js/config/commands.ts', 'lang/id.json', 'routes/web.php'] as $file) {
        File::ensureDirectoryExists(dirname("{$sandbox}/{$file}"));
        File::copy(base_path($file), "{$sandbox}/{$file}");
    }

    return $sandbox;
}

afterEach(function () {
    File::deleteDirectory(storage_path('framework/testing'));
});

test('fields are parsed with their type, optional flag and options', function () {
    $fields = ModuleField::parseList('name:string, email:email?, kind:select(retail, corporate), credit_limit:currency');

    expect($fields)->toHaveCount(4)
        ->and($fields[1]->isRequired)->toBeFalse()
        ->and($fields[2]->options)->toBe(['retail', 'corporate'])
        ->and($fields[3]->migrationColumn())->toBe("\$table->unsignedBigInteger('credit_limit')->default(0);");
});

test('invalid field definitions are explained', function (string $definition, string $message) {
    expect(fn () => ModuleField::parseList($definition))->toThrow(InvalidArgumentException::class, $message);
})->with([
    'unknown type' => ['name:money', 'Unknown type'],
    'reserved name' => ['status:string', 'added automatically'],
    'select without options' => ['kind:select(one)', 'at least two options'],
    'duplicate' => ['name:string, name:text', 'only once'],
]);

test('a module needs a required string field as its title', function () {
    expect(fn () => new ModuleBlueprint('Client', ModuleField::parseList('amount:currency'), 'page', 'Master Data', 'Folder'))
        ->toThrow(InvalidArgumentException::class, 'record title');
});

test('names follow every convention', function () {
    $blueprint = new ModuleBlueprint('product categories', ModuleField::parseList('title:string'), 'page', 'Catalog', 'Package');

    expect($blueprint->model)->toBe('ProductCategory')
        ->and($blueprint->slug)->toBe('product-categories')
        ->and($blueprint->table)->toBe('product_categories')
        ->and($blueprint->routeParameter)->toBe('product_category')
        ->and($blueprint->titlePlural())->toBe('Product categories');
});

test('a mixed module is written and registered in the shared files', function () {
    $sandbox = moduleSandbox();
    $blueprint = new ModuleBlueprint('Client', ModuleField::parseList('name:string, email:email?, kind:select(retail,corporate), notes:text?'), 'mixed', 'Customers', 'Briefcase');
    $generator = new ModuleGenerator($blueprint, $sandbox);

    $created = $generator->generate();
    $added = $generator->addTranslations();

    expect($created)->toContain('app/Http/Controllers/ClientController.php', 'resources/js/pages/clients/show.tsx', 'resources/js/components/admin/client-quick-form.tsx', 'app/Enums/ClientKind.php')
        ->not->toContain('resources/js/pages/clients/create.tsx');

    foreach ($created as $file) {
        // No stub placeholder or {{#if}} block may be left (JSX itself may contain "{{").
        expect(File::get("{$sandbox}/{$file}"))->not->toMatch('/\{\{ \w+ \}\}|\{\{[#\/]if/');
    }

    expect(File::get("{$sandbox}/app/Enums/Permission.php"))
        ->toContain("case ClientsView = 'clients.view';", "self::ClientsUpdate => __('Edit clients'),", '// @module-generator:cases')
        ->and(File::get("{$sandbox}/resources/js/config/navigation.ts"))
        ->toContain("label: 'Customers'", "href: '/clients', permission: 'clients.view'", 'Briefcase }')
        ->and(File::get("{$sandbox}/resources/js/config/commands.ts"))
        ->toContain("href: '/clients?create=1'")
        ->and(File::get("{$sandbox}/routes/modules/clients.php"))
        ->toContain("Route::patch('clients/{client}/quick'")
        ->and($added)->toContain('Add client', 'Customers', 'Quick edit client')
        ->and(json_decode(File::get("{$sandbox}/lang/id.json"), true))->toHaveKey('Add client');
});

test('a module is added to an existing menu group', function () {
    $sandbox = moduleSandbox();
    (new ModuleGenerator(new ModuleBlueprint('Warehouse', ModuleField::parseList('name:string'), 'page', 'Master Data', 'Warehouse'), $sandbox))->generate();

    $navigation = File::get("{$sandbox}/resources/js/config/navigation.ts");

    expect(substr_count($navigation, "label: 'Master Data'"))->toBe(1)
        ->and($navigation)->toMatch("/href: '\\/vendors'[^\\]]*href: '\\/warehouses'/s");
});

test('an existing module is refused', function () {
    $generator = new ModuleGenerator(new ModuleBlueprint('Vendor', ModuleField::parseList('name:string'), 'page', 'Master Data', 'Folder'), base_path());

    expect($generator->problems())->toContain('Already exists: app/Models/Vendor.php');
});

test('the dry run lists the files without writing them', function () {
    $this->artisan('make:module', ['name' => 'Warehouse', '--fields' => 'name:string, capacity:integer', '--dry-run' => true])
        ->expectsOutputToContain('app/Http/Controllers/WarehouseController.php')
        ->assertSuccessful();

    expect(File::exists(app_path('Models/Warehouse.php')))->toBeFalse();
});

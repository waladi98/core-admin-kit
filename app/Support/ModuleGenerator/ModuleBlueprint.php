<?php

namespace App\Support\ModuleGenerator;

use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * Everything the generator needs to know about one module: its names in every
 * convention, its fields, the pattern (page / mixed) and where its menu goes.
 *
 * `tokens()` returns the `{{ placeholders }}` filled into the stubs in stubs/module.
 */
class ModuleBlueprint
{
    public const PATTERNS = [
        'page' => 'Add and edit on their own pages (like Users).',
        'mixed' => 'Quick add / quick edit in a modal, full edit and details on pages (like Vendors).',
    ];

    /** Fields shown in the quick add modal of the mixed pattern (besides the title). */
    private const QUICK_FORM_LIMIT = 4;

    public readonly string $model;

    public readonly string $modelPlural;

    /** URL, route names, permission prefix and page folder, e.g. "product-categories". */
    public readonly string $slug;

    /** File names of the form components and types, e.g. "product-category". */
    public readonly string $slugSingular;

    public readonly string $table;

    /** Laravel resource route parameter, e.g. "product_category". */
    public readonly string $routeParameter;

    public readonly ModuleField $titleField;

    /**
     * @param  list<ModuleField>  $fields
     */
    public function __construct(
        string $name,
        public readonly array $fields,
        public readonly string $pattern,
        public readonly string $menuGroup,
        public readonly string $icon,
    ) {
        $this->model = Str::studly(Str::singular(trim($name)));

        if (! preg_match('/^[A-Z][A-Za-z0-9]*$/', $this->model) || $this->model === '') {
            throw new InvalidArgumentException('Use a module name made of letters, e.g. Client or ProductCategory.');
        }

        if (! array_key_exists($pattern, self::PATTERNS)) {
            throw new InvalidArgumentException('Pattern must be "page" or "mixed".');
        }

        if (! preg_match('/^[A-Z][A-Za-z0-9]*$/', $icon)) {
            throw new InvalidArgumentException('Use a Lucide icon name in PascalCase, e.g. Briefcase (see lucide.dev/icons).');
        }

        $titleField = collect($fields)->first(fn (ModuleField $field): bool => $field->type === 'string');

        if (! $titleField instanceof ModuleField || ! $titleField->isRequired) {
            throw new InvalidArgumentException('The first string field is the record title and must be required, e.g. name:string.');
        }

        $this->titleField = $titleField;
        $this->modelPlural = Str::plural($this->model);
        $this->slug = Str::kebab($this->modelPlural);
        $this->slugSingular = Str::kebab($this->model);
        $this->table = Str::snake($this->modelPlural);
        $this->routeParameter = Str::snake($this->model);
    }

    public function isMixed(): bool
    {
        return $this->pattern === 'mixed';
    }

    /** "ProductCategory" → "Product category". */
    public function titleSingular(): string
    {
        return Str::ucfirst(Str::lower(Str::headline($this->model)));
    }

    /** "ProductCategory" → "Product categories". */
    public function titlePlural(): string
    {
        return Str::ucfirst(Str::lower(Str::headline($this->modelPlural)));
    }

    /**
     * Fields of the quick add modal: every required field without a default (they must be filled
     * on create), topped up with other short fields.
     *
     * @return list<ModuleField>
     */
    public function quickFields(): array
    {
        $mustHave = array_values(array_filter($this->fields, fn (ModuleField $field): bool => $field->isRequired && ! $field->hasDefault()));
        $extra = array_values(array_filter($this->fields, fn (ModuleField $field): bool => $field->fitsQuickForm() && ! in_array($field, $mustHave, true)));

        return [...$mustHave, ...array_slice($extra, 0, max(0, self::QUICK_FORM_LIMIT - count($mustHave)))];
    }

    /**
     * @return list<ModuleField>
     */
    public function selectFields(): array
    {
        return array_values(array_filter($this->fields, fn (ModuleField $field): bool => $field->type === 'select'));
    }

    /**
     * @return list<string>
     */
    public function searchableColumns(): array
    {
        return array_values(array_map(
            fn (ModuleField $field): string => $field->name,
            array_filter($this->fields, fn (ModuleField $field): bool => in_array($field->type, ['string', 'email', 'phone'], true)),
        ));
    }

    /**
     * Placeholder values for the stubs.
     *
     * @return array<string, string>
     */
    public function tokens(): array
    {
        $title = $this->titleField;
        $quick = $this->quickFields();

        return [
            'Model' => $this->model,
            'Models' => $this->modelPlural,
            'model' => Str::camel($this->model),
            'models' => Str::camel($this->modelPlural),
            'slug' => $this->slug,
            'slugSingular' => $this->slugSingular,
            'table' => $this->table,
            'routeParameter' => $this->routeParameter,
            'Title' => $this->titleSingular(),
            'Titles' => $this->titlePlural(),
            'title' => Str::lower($this->titleSingular()),
            'titles' => Str::lower($this->titlePlural()),
            'icon' => $this->icon,
            'menuGroup' => $this->menuGroup,
            'titleField' => $title->name,
            'titleFieldCamel' => $title->camel(),
            'titleFieldLabel' => $title->label(),
            'titleFieldTestValue' => $title->testValue(),
            'permissionCase' => $this->modelPlural,
            'searchPlaceholder' => 'Search '.$this->joinWords(array_map(fn (string $column): string => Str::lower(Str::headline($column)), $this->searchableColumns())).'…',

            // PHP
            'migrationColumns' => $this->lines(array_map(fn (ModuleField $field): string => $field->migrationColumn(), $this->fields), 12),
            'fillable' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}',", $this->fields), 8),
            'casts' => $this->lines(array_filter(array_map(fn (ModuleField $field): ?string => ($cast = $field->cast($this->model)) === null ? null : "'{$field->name}' => {$cast},", $this->fields)), 12),
            'enumImports' => $this->lines(array_map(fn (ModuleField $field): string => 'use App\\Enums\\'.$field->enumClass($this->model).';', $this->selectFields()), 0),
            'factoryDefinition' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => {$field->factoryValue($this->model)},", $this->fields), 12),
            'quickRules' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => {$field->rules($this->model)},", $quick), 12),
            'rules' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => {$field->rules($this->model)},", $this->fields), 12),
            'searchColumns' => $this->searchQuery(),
            'sortable' => implode(', ', array_map(fn (string $column): string => "'{$column}'", [...array_map(fn (ModuleField $field): string => $field->name, array_filter($this->fields, fn (ModuleField $field): bool => $field->isSortable())), 'created_at'])),
            'presentFields' => $this->lines(array_merge(...array_map(fn (ModuleField $field): array => array_filter([
                "'{$field->camel()}' => {$field->presentValue()},",
                $field->type === 'select' ? "'{$field->camel()}Label' => \$record->{$field->name}?->label()," : null,
            ]), $this->fields)), 12),
            'optionProps' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->camel()}Options' => {$field->enumClass($this->model)}::options(),", $this->selectFields()), 12),
            'selectFilterRules' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => ['nullable', 'string', Rule::enum({$field->enumClass($this->model)}::class)],", $this->selectFields()), 12),
            'selectFilterQuery' => $this->lines(array_map(fn (ModuleField $field): string => "->when(\$request->validated('{$field->name}'), fn (Builder \$query, string \$value) => \$query->where('{$field->name}', \$value))", $this->selectFields()), 12),
            'selectFilterProps' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->camel()}' => \$request->validated('{$field->name}'),", $this->selectFields()), 16),
            'testPayload' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => {$field->testValue()},", $this->fields), 8),
            'testQuickPayload' => $this->lines(array_map(fn (ModuleField $field): string => "'{$field->name}' => {$field->testValue()},", $quick), 8),
            'invalidFields' => implode(', ', array_map(fn (ModuleField $field): string => "'{$field->name}'", array_filter($quick, fn (ModuleField $field): bool => $field->isRequired && ! $field->hasDefault()))),

            // TypeScript
            'tsFields' => $this->lines(array_merge(...array_map(fn (ModuleField $field): array => array_filter([
                "{$field->camel()}: {$field->tsType()};",
                $field->type === 'select' ? "{$field->camel()}Label: string | null;" : null,
            ]), $this->fields)), 4),
            'tsFormFields' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->name}: {$field->tsFormType()};", $this->fields), 4),
            'tsQuickFormFields' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->name}: {$field->tsFormType()};", $quick), 4),
            'tsOptionProps' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->camel()}Options: SelectOption[];", $this->selectFields()), 4),
            'tsSelectFilters' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->camel()}: string | null;", $this->selectFields()), 4),
            'tsEmptyValues' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->name}: {$field->tsEmptyValue()},", $this->fields), 8),
            'tsRecordValues' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->name}: {$field->tsRecordValue('record')},", $this->fields), 8),
            'tsQuickEmptyValues' => $this->lines(array_map(fn (ModuleField $field): string => "{$field->name}: record ? {$field->tsRecordValue('record')} : {$field->tsEmptyValue()},", $quick), 8),
            'formControls' => $this->lines(array_map(fn (ModuleField $field): string => $field->formControl(), $this->fields), 24),
            'quickFormControls' => $this->lines(array_map(fn (ModuleField $field): string => $field->formControl('quick-'), $quick), 16),
            'optionPropNames' => implode(', ', array_map(fn (ModuleField $field): string => "{$field->camel()}Options", $this->selectFields())),
            'tableColumns' => $this->lines(array_map(fn (ModuleField $field): string => $this->tableColumn($field), array_values(array_filter($this->fields, fn (ModuleField $field): bool => $field->isListed() && $field !== $this->titleField))), 4),
            'detailItems' => $this->lines(array_map(fn (ModuleField $field): string => "{ label: '{$field->label()}', value: {$field->detailValue()} },", array_values(array_filter($this->fields, fn (ModuleField $field): bool => $field !== $this->titleField))), 32),
        ];
    }

    private function tableColumn(ModuleField $field): string
    {
        $sortable = $field->isSortable() ? ' sortable: true,' : '';
        $skeleton = in_array($field->type, ['select', 'boolean'], true) ? " skeleton: 'badge'," : '';
        $align = in_array($field->type, ['currency', 'integer'], true) ? " className: 'text-right'," : '';

        return "{ key: '{$field->name}', header: '{$field->label()}',{$sortable}{$skeleton}{$align} cell: (record) => {$field->tableCell()} },";
    }

    private function searchQuery(): string
    {
        $columns = $this->searchableColumns();
        $first = array_shift($columns);
        $chain = "\$query->whereLike('{$first}', \"%{\$search}%\")";

        foreach ($columns as $column) {
            $chain .= "->orWhereLike('{$column}', \"%{\$search}%\")";
        }

        return $chain;
    }

    /**
     * @param  list<string>  $words
     */
    private function joinWords(array $words): string
    {
        if (count($words) <= 1) {
            return $words[0] ?? '';
        }

        $last = array_pop($words);

        return implode(', ', $words).' or '.$last;
    }

    /**
     * Joins code lines, indenting every line after the first (the stub already indents the first).
     *
     * @param  iterable<string>  $lines
     */
    private function lines(iterable $lines, int $indent): string
    {
        $padding = str_repeat(' ', $indent);
        $text = implode("\n", is_array($lines) ? $lines : iterator_to_array($lines));

        return str_replace("\n", "\n".$padding, $text);
    }
}

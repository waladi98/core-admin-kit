<?php

namespace App\Support\ModuleGenerator;

use Illuminate\Support\Str;
use InvalidArgumentException;

/**
 * One field of a generated module, parsed from "name:type" ("?" after the type = optional),
 * e.g. "credit_limit:currency", "email:email?", "kind:select(goods,services)".
 *
 * Each method returns the code snippet for one layer (migration, validation, form, table…).
 */
class ModuleField
{
    /**
     * Supported types with what they become. Shown on Support → About template.
     *
     * @var array<string, array{column: string, input: string, description: string}>
     */
    public const TYPES = [
        'string' => ['column' => 'string', 'input' => 'Input', 'description' => 'Short text. The first string field is the record title: searchable, sortable and linked.'],
        'text' => ['column' => 'text', 'input' => 'Textarea', 'description' => 'Long text, shown on the form and detail page only.'],
        'email' => ['column' => 'string', 'input' => 'Input type=email', 'description' => 'Email address, also searchable.'],
        'phone' => ['column' => 'string(30)', 'input' => 'Input type=tel', 'description' => 'Phone number: digits, spaces, +, - and brackets.'],
        'integer' => ['column' => 'integer', 'input' => 'Input type=number', 'description' => 'Whole number.'],
        'currency' => ['column' => 'unsignedBigInteger', 'input' => 'CurrencyInput', 'description' => 'Rupiah amount in whole units; sortable.'],
        'date' => ['column' => 'date', 'input' => 'DatePicker', 'description' => 'Calendar date; sortable.'],
        'boolean' => ['column' => 'boolean', 'input' => 'Switch', 'description' => 'Yes / no.'],
        'select' => ['column' => 'string + PHP enum', 'input' => 'Select', 'description' => 'One of fixed options: select(goods,services). Creates an enum and a filter.'],
    ];

    /** Columns every generated module already has. */
    private const RESERVED = ['id', 'status', 'created_at', 'updated_at'];

    /**
     * @param  list<string>  $options  Option values for `select`.
     */
    public function __construct(
        public readonly string $name,
        public readonly string $type,
        public readonly bool $isRequired,
        public readonly array $options = [],
    ) {}

    public static function parse(string $definition): self
    {
        if (! preg_match('/^\s*([a-z][a-z0-9_]*)\s*:\s*([a-z]+)(?:\(([^)]*)\))?(\?)?\s*$/', $definition, $matches)) {
            throw new InvalidArgumentException("Cannot read the field \"{$definition}\". Use name:type, e.g. credit_limit:currency or email:email?.");
        }

        [$name, $type, $options, $isOptional] = [$matches[1], $matches[2], $matches[3] ?? '', ($matches[4] ?? '') === '?'];

        if (! array_key_exists($type, self::TYPES)) {
            throw new InvalidArgumentException("Unknown type \"{$type}\" for {$name}. Use one of: ".implode(', ', array_keys(self::TYPES)).'.');
        }

        if (in_array($name, self::RESERVED, true)) {
            throw new InvalidArgumentException("\"{$name}\" is added automatically; choose another field name.");
        }

        $values = array_values(array_filter(array_map(fn (string $value): string => Str::snake(trim($value)), explode(',', $options))));

        if ($type === 'select' && count($values) < 2) {
            throw new InvalidArgumentException("The select field {$name} needs at least two options, e.g. {$name}:select(goods,services).");
        }

        return new self($name, $type, ! $isOptional, $values);
    }

    /**
     * @return list<self>
     */
    public static function parseList(string $definitions): array
    {
        $fields = array_map(fn (string $definition): self => self::parse($definition), array_filter(array_map('trim', preg_split('/,(?![^(]*\))/', $definitions) ?: [])));

        $names = array_map(fn (self $field): string => $field->name, $fields);

        if (count($names) !== count(array_unique($names))) {
            throw new InvalidArgumentException('Each field name may appear only once.');
        }

        return $fields;
    }

    /** "credit_limit" → "creditLimit" (prop names on the frontend). */
    public function camel(): string
    {
        return Str::camel($this->name);
    }

    /** "credit_limit" → "Credit limit". */
    public function label(): string
    {
        return Str::ucfirst(Str::lower(Str::headline($this->name)));
    }

    /** Enum class for a select field, e.g. ClientKind. */
    public function enumClass(string $model): string
    {
        return $model.Str::studly($this->name);
    }

    /** Fields that fit a table column (long text does not). */
    public function isListed(): bool
    {
        return $this->type !== 'text';
    }

    public function isSortable(): bool
    {
        return in_array($this->type, ['string', 'currency', 'integer', 'date'], true);
    }

    /** Fields that fit the quick add modal of the mixed pattern. */
    public function fitsQuickForm(): bool
    {
        return ! in_array($this->type, ['text', 'boolean'], true);
    }

    /** Required numbers and switches get a database default, so quick add may leave them out. */
    public function hasDefault(): bool
    {
        return in_array($this->type, ['integer', 'currency', 'boolean'], true);
    }

    public function migrationColumn(): string
    {
        $column = match ($this->type) {
            'text' => "\$table->text('{$this->name}')",
            'phone' => "\$table->string('{$this->name}', 30)",
            'integer' => "\$table->integer('{$this->name}')",
            'currency' => "\$table->unsignedBigInteger('{$this->name}')",
            'date' => "\$table->date('{$this->name}')",
            'boolean' => "\$table->boolean('{$this->name}')",
            'select' => "\$table->string('{$this->name}')->index()",
            default => "\$table->string('{$this->name}')",
        };

        if (! $this->isRequired) {
            return $column.'->nullable();';
        }

        return $column.match ($this->type) {
            'integer', 'currency' => '->default(0);',
            'boolean' => '->default(false);',
            default => ';',
        };
    }

    /** Cast for the model's casts() array, or null when none is needed. */
    public function cast(string $model): ?string
    {
        return match ($this->type) {
            'integer', 'currency' => "'integer'",
            'date' => "'date'",
            'boolean' => "'boolean'",
            'select' => $this->enumClass($model).'::class',
            default => null,
        };
    }

    /**
     * Validation rules as PHP code, e.g. "['required', 'string', 'max:255']".
     */
    public function rules(string $model): string
    {
        $presence = $this->isRequired ? "'required'" : "'nullable'";

        $rules = match ($this->type) {
            'text' => ["'string'", "'max:2000'"],
            'email' => ["'string'", "'lowercase'", "'email'", "'max:255'"],
            'phone' => ["'string'", "'max:30'", "'regex:/^[0-9+\\-\\s()]+$/'"],
            'integer' => ["'integer'"],
            'currency' => ["'integer'", "'min:0'", "'max:1000000000000'"],
            'date' => ["'date'"],
            'boolean' => ["'boolean'"],
            'select' => ['Rule::enum('.$this->enumClass($model).'::class)'],
            default => ["'string'", "'max:255'"],
        };

        // Numbers and switches always arrive from the form (they have a value even when empty).
        if ($this->isRequired && $this->hasDefault()) {
            $presence = "'required'";
        }

        return '['.implode(', ', [$presence, ...$rules]).']';
    }

    /** Factory value as PHP code. */
    public function factoryValue(string $model): string
    {
        $value = match ($this->type) {
            'text' => 'fake()->sentence(12)',
            'email' => 'fake()->safeEmail()',
            'phone' => "fake()->numerify('08##########')",
            'integer' => 'fake()->numberBetween(1, 100)',
            'currency' => 'fake()->numberBetween(1, 500) * 100_000',
            'date' => "fake()->dateTimeBetween('-1 year')->format('Y-m-d')",
            'boolean' => 'fake()->boolean()',
            'select' => 'fake()->randomElement('.$this->enumClass($model).'::cases())',
            default => str_contains($this->name, 'name') ? 'fake()->company()' : 'Str::ucfirst(fake()->words(3, true))',
        };

        return $this->isRequired ? $value : "fake()->optional(0.8)->passthrough({$value})";
    }

    /** A valid value for tests, as PHP code. */
    public function testValue(): string
    {
        return match ($this->type) {
            'text' => "'Some longer note.'",
            'email' => "'contact@example.test'",
            'phone' => "'0812 3456 7890'",
            'integer' => '42',
            'currency' => '2_500_000',
            'date' => "'2026-01-15'",
            'boolean' => 'true',
            'select' => "'{$this->options[0]}'",
            default => "'Example ".Str::lower($this->label())."'",
        };
    }

    /** Value sent to the frontend, as PHP code reading `$record`. */
    public function presentValue(): string
    {
        return match ($this->type) {
            'date' => "\$record->{$this->name}?->toDateString()",
            'select' => "\$record->{$this->name}?->value",
            default => "\$record->{$this->name}",
        };
    }

    /** TypeScript type of the prop. */
    public function tsType(): string
    {
        $type = match ($this->type) {
            'integer', 'currency' => 'number',
            'boolean' => 'boolean',
            default => 'string',
        };

        return $this->isRequired || $this->hasDefault() ? $type : "{$type} | null";
    }

    /** TypeScript type inside the form data (empty inputs are '' instead of null). */
    public function tsFormType(): string
    {
        return match ($this->type) {
            'integer', 'currency' => 'number',
            'boolean' => 'boolean',
            default => 'string',
        };
    }

    /** Initial form value when creating, as TypeScript. */
    public function tsEmptyValue(): string
    {
        return match ($this->type) {
            'integer', 'currency' => '0',
            'boolean' => 'false',
            'select' => "'{$this->options[0]}'",
            default => "''",
        };
    }

    /** Initial form value from a record prop, as TypeScript, e.g. "record.creditLimit". */
    public function tsRecordValue(string $variable): string
    {
        return match ($this->type) {
            'integer', 'currency', 'boolean' => "{$variable}.{$this->camel()}",
            default => $this->isRequired ? "{$variable}.{$this->camel()}" : "{$variable}.{$this->camel()} ?? ''",
        };
    }

    /**
     * Form control as JSX for the full form (`data`, `setData`, `errors` from useForm).
     */
    public function formControl(string $idPrefix = ''): string
    {
        $id = $idPrefix.$this->name;
        $invalid = "invalid={Boolean(errors.{$this->name})}";
        $required = $this->isRequired && ! $this->hasDefault() ? ' required' : '';

        $control = match ($this->type) {
            'text' => "<Textarea id=\"{$id}\" rows={3} value={data.{$this->name}} onChange={(event) => setData('{$this->name}', event.target.value)}{$required} {$invalid} />",
            'email' => "<Input id=\"{$id}\" type=\"email\" value={data.{$this->name}} onChange={(event) => setData('{$this->name}', event.target.value)} autoComplete=\"off\"{$required} {$invalid} />",
            'phone' => "<Input id=\"{$id}\" type=\"tel\" value={data.{$this->name}} onChange={(event) => setData('{$this->name}', event.target.value)} autoComplete=\"off\"{$required} {$invalid} />",
            'integer' => "<Input id=\"{$id}\" type=\"number\" value={data.{$this->name}} onChange={(event) => setData('{$this->name}', Number(event.target.value))} {$invalid} />",
            'currency' => "<CurrencyInput id=\"{$id}\" value={data.{$this->name}} onChange={(value) => setData('{$this->name}', value ?? 0)} {$invalid} />",
            'date' => "<DatePicker id=\"{$id}\" value={data.{$this->name}} onChange={(value) => setData('{$this->name}', value)}{$required} {$invalid} />",
            'boolean' => "<Switch id=\"{$id}\" checked={data.{$this->name}} onChange={(checked) => setData('{$this->name}', checked)} label={__('Yes')} />",
            'select' => "<Select id=\"{$id}\" options={{$this->camel()}Options} value={data.{$this->name}} onChange={(event) => setData('{$this->name}', event.target.value)} {$invalid} />",
            default => "<Input id=\"{$id}\" value={data.{$this->name}} onChange={(event) => setData('{$this->name}', event.target.value)} autoComplete=\"off\"{$required} {$invalid} />",
        };

        $requiredProp = $this->isRequired ? ' required' : '';
        $wide = $this->type === 'text' ? ' className="md:col-span-2 xl:col-span-3"' : '';

        return "<FormField label=\"{$this->label()}\" htmlFor=\"{$id}\"{$requiredProp} error={errors.{$this->name}}{$wide}>\n    {$control}\n</FormField>";
    }

    /** Table cell content as JSX for a row named `record`. */
    public function tableCell(): string
    {
        $value = "record.{$this->camel()}";

        return match ($this->type) {
            'currency' => "<span className=\"tabular-nums\">{formatCurrency({$value})}</span>",
            'integer' => "<span className=\"tabular-nums\">{formatNumber({$value})}</span>",
            'date' => "formatDate({$value})",
            'boolean' => "<Badge shape=\"pill\" tone={{$value} ? 'success' : 'neutral'}>{{$value} ? __('Yes') : __('No')}</Badge>",
            'select' => "<Badge shape=\"pill\">{record.{$this->camel()}Label}</Badge>",
            default => $this->isRequired ? $value : "{$value} ?? '—'",
        };
    }

    /** Value on the detail page as JSX. */
    public function detailValue(): string
    {
        $value = "record.{$this->camel()}";

        return match ($this->type) {
            'currency' => "formatCurrency({$value})",
            'integer' => "formatNumber({$value})",
            'date' => "{$value} && formatDate({$value})",
            'boolean' => "{$value} ? __('Yes') : __('No')",
            'select' => "record.{$this->camel()}Label",
            'text' => "{$value} && <span className=\"whitespace-pre-line\">{{$value}}</span>",
            default => $value,
        };
    }
}

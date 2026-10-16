import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { FileText, ImageUp, UploadCloud, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState, type DragEvent } from 'react';
import { Avatar } from './avatar';

export interface FileUploadProps {
    value: File | null;
    onChange: (file: File | null) => void;
    /** e.g. "image/*" or ".pdf,.xlsx" */
    accept?: string;
    /** Maximum size in megabytes; larger files are rejected with a message. */
    maxSizeMb?: number;
    /** "avatar" shows a round image preview next to the drop area. */
    variant?: 'default' | 'avatar';
    /** Image already saved on the server (avatar variant). */
    currentUrl?: string | null;
    /** Name used for the avatar initials when there is no image. */
    name?: string;
    hint?: string;
    invalid?: boolean;
    disabled?: boolean;
    id?: string;
}

function formatSize(bytes: number): string {
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
    if (!accept) {
        return true;
    }

    return accept.split(',').some((rule) => {
        const pattern = rule.trim().toLowerCase();

        if (pattern.startsWith('.')) {
            return file.name.toLowerCase().endsWith(pattern);
        }

        return pattern.endsWith('/*') ? file.type.startsWith(pattern.slice(0, -1)) : file.type === pattern;
    });
}

/**
 * Click or drag-and-drop file field. Validates type and size in the browser for quick
 * feedback; the server must still validate (`file`, `mimes`, `max`).
 */
export function FileUpload({
    value,
    onChange,
    accept,
    maxSizeMb = 2,
    variant = 'default',
    currentUrl = null,
    name = '',
    hint,
    invalid = false,
    disabled = false,
    id,
}: FileUploadProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const previewUrl = useMemo(() => (value && value.type.startsWith('image/') ? URL.createObjectURL(value) : null), [value]);

    useEffect(() => () => void (previewUrl && URL.revokeObjectURL(previewUrl)), [previewUrl]);

    const select = (file: File | undefined) => {
        if (!file) {
            return;
        }

        if (!matchesAccept(file, accept)) {
            setLocalError(__('This file type is not allowed.'));
            return;
        }

        if (file.size > maxSizeMb * 1024 * 1024) {
            setLocalError(__('The file must not be larger than :size MB.', { size: maxSizeMb }));
            return;
        }

        setLocalError(null);
        onChange(file);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (!disabled) {
            select(event.dataTransfer.files[0]);
        }
    };

    const clear = () => {
        onChange(null);
        setLocalError(null);

        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const dropZone = (
        <label
            htmlFor={inputId}
            onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
                'rounded-field flex min-h-20 flex-1 cursor-pointer flex-col items-center justify-center gap-1 border border-dashed px-4 py-3 text-center transition-colors',
                isDragging ? 'border-brand bg-surface-muted' : 'border-line-strong hover:bg-surface-hover',
                (invalid || localError) && 'border-danger',
                disabled && 'cursor-not-allowed opacity-60',
            )}
        >
            {variant === 'avatar' ? <ImageUp className="text-ink-subtle size-5" /> : <UploadCloud className="text-ink-subtle size-5" />}
            <span className="text-ink-soft text-sm">
                <span className="text-ink font-medium underline underline-offset-4">{__('Choose a file')}</span> {__('or drag it here')}
            </span>
            <span className="text-ink-muted text-xs">{hint ? __(hint) : __('Up to :size MB', { size: maxSizeMb })}</span>
            <input
                ref={inputRef}
                id={inputId}
                type="file"
                accept={accept}
                disabled={disabled}
                onChange={(event) => select(event.target.files?.[0])}
                className="sr-only"
            />
        </label>
    );

    return (
        <div className="space-y-2">
            {variant === 'avatar' ? (
                <div className="flex items-center gap-4">
                    <Avatar name={name} src={previewUrl ?? currentUrl} size="lg" className="size-16 text-lg" />
                    {dropZone}
                </div>
            ) : (
                dropZone
            )}

            {value && (
                <div className="rounded-field border-line bg-surface-muted flex items-center gap-2 border px-3 py-2 text-sm">
                    <FileText className="text-ink-muted size-4 shrink-0" aria-hidden="true" />
                    <span className="text-ink min-w-0 flex-1 truncate">{value.name}</span>
                    <span className="text-ink-muted shrink-0 text-xs tabular-nums">{formatSize(value.size)}</span>
                    <button
                        type="button"
                        onClick={clear}
                        aria-label={__('Remove file')}
                        className="text-ink-muted hover:text-ink rounded-field inline-flex size-6 shrink-0 items-center justify-center"
                    >
                        <X className="size-3.5" />
                    </button>
                </div>
            )}

            {localError && <p className="text-danger text-xs">{localError}</p>}
        </div>
    );
}

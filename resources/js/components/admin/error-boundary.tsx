import { Button } from '@/components/core';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    /** Changing this value clears the error, e.g. the page URL. */
    resetKey?: unknown;
    /** "section" for a widget, "page" for the whole page content. */
    size?: 'section' | 'page';
    className?: string;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * Catches rendering errors so one broken widget does not blank the whole screen.
 * AdminLayout wraps every page; wrap risky widgets (charts, third-party embeds) too.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('Finance Core: a component failed to render.', error, info.componentStack);
    }

    componentDidUpdate(previousProps: ErrorBoundaryProps): void {
        if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
            this.setState({ error: null });
        }
    }

    render(): ReactNode {
        if (!this.state.error) {
            return this.props.children;
        }

        const isPage = this.props.size === 'page';

        return (
            <div
                role="alert"
                className={cn(
                    'rounded-panel border-line bg-surface flex flex-col items-center justify-center gap-2 border border-dashed p-6 text-center',
                    isPage ? 'min-h-64' : 'h-full min-h-32',
                    this.props.className,
                )}
            >
                <TriangleAlert className="text-warning size-5" aria-hidden="true" />
                <p className="text-ink text-sm font-medium">
                    {isPage ? __('This page could not be displayed.') : __('This section could not be displayed.')}
                </p>
                <p className="text-ink-muted text-xs">{__('Try again. If it keeps happening, contact your administrator.')}</p>
                <Button variant="secondary" size="sm" className="mt-1" onClick={() => this.setState({ error: null })}>
                    <RotateCcw />
                    {__('Try again')}
                </Button>
            </div>
        );
    }
}

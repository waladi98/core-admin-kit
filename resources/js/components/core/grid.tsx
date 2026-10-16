import { cn } from '@/lib/utils';
import { Children, cloneElement, isValidElement, type ComponentProps, type CSSProperties, type ReactNode } from 'react';

type ColumnSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type RowSpan = 1 | 2 | 3 | 4;
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type ResponsiveColumnSpan = ColumnSpan | Partial<Record<Breakpoint, ColumnSpan>>;
export type ResponsiveRowSpan = RowSpan | Partial<Record<Breakpoint, RowSpan>>;

/**
 * Class names are written out in full so Tailwind can detect them at build time.
 */
const columnSpanClasses: Record<Breakpoint, Record<ColumnSpan, string>> = {
    base: {
        1: 'col-span-1',
        2: 'col-span-2',
        3: 'col-span-3',
        4: 'col-span-4',
        5: 'col-span-5',
        6: 'col-span-6',
        7: 'col-span-7',
        8: 'col-span-8',
        9: 'col-span-9',
        10: 'col-span-10',
        11: 'col-span-11',
        12: 'col-span-12',
    },
    sm: {
        1: 'sm:col-span-1',
        2: 'sm:col-span-2',
        3: 'sm:col-span-3',
        4: 'sm:col-span-4',
        5: 'sm:col-span-5',
        6: 'sm:col-span-6',
        7: 'sm:col-span-7',
        8: 'sm:col-span-8',
        9: 'sm:col-span-9',
        10: 'sm:col-span-10',
        11: 'sm:col-span-11',
        12: 'sm:col-span-12',
    },
    md: {
        1: 'md:col-span-1',
        2: 'md:col-span-2',
        3: 'md:col-span-3',
        4: 'md:col-span-4',
        5: 'md:col-span-5',
        6: 'md:col-span-6',
        7: 'md:col-span-7',
        8: 'md:col-span-8',
        9: 'md:col-span-9',
        10: 'md:col-span-10',
        11: 'md:col-span-11',
        12: 'md:col-span-12',
    },
    lg: {
        1: 'lg:col-span-1',
        2: 'lg:col-span-2',
        3: 'lg:col-span-3',
        4: 'lg:col-span-4',
        5: 'lg:col-span-5',
        6: 'lg:col-span-6',
        7: 'lg:col-span-7',
        8: 'lg:col-span-8',
        9: 'lg:col-span-9',
        10: 'lg:col-span-10',
        11: 'lg:col-span-11',
        12: 'lg:col-span-12',
    },
    xl: {
        1: 'xl:col-span-1',
        2: 'xl:col-span-2',
        3: 'xl:col-span-3',
        4: 'xl:col-span-4',
        5: 'xl:col-span-5',
        6: 'xl:col-span-6',
        7: 'xl:col-span-7',
        8: 'xl:col-span-8',
        9: 'xl:col-span-9',
        10: 'xl:col-span-10',
        11: 'xl:col-span-11',
        12: 'xl:col-span-12',
    },
    '2xl': {
        1: '2xl:col-span-1',
        2: '2xl:col-span-2',
        3: '2xl:col-span-3',
        4: '2xl:col-span-4',
        5: '2xl:col-span-5',
        6: '2xl:col-span-6',
        7: '2xl:col-span-7',
        8: '2xl:col-span-8',
        9: '2xl:col-span-9',
        10: '2xl:col-span-10',
        11: '2xl:col-span-11',
        12: '2xl:col-span-12',
    },
};

const rowSpanClasses: Record<Breakpoint, Record<RowSpan, string>> = {
    base: { 1: 'row-span-1', 2: 'row-span-2', 3: 'row-span-3', 4: 'row-span-4' },
    sm: { 1: 'sm:row-span-1', 2: 'sm:row-span-2', 3: 'sm:row-span-3', 4: 'sm:row-span-4' },
    md: { 1: 'md:row-span-1', 2: 'md:row-span-2', 3: 'md:row-span-3', 4: 'md:row-span-4' },
    lg: { 1: 'lg:row-span-1', 2: 'lg:row-span-2', 3: 'lg:row-span-3', 4: 'lg:row-span-4' },
    xl: { 1: 'xl:row-span-1', 2: 'xl:row-span-2', 3: 'xl:row-span-3', 4: 'xl:row-span-4' },
    '2xl': { 1: '2xl:row-span-1', 2: '2xl:row-span-2', 3: '2xl:row-span-3', 4: '2xl:row-span-4' },
};

const gapClasses = {
    sm: 'gap-3',
    md: 'gap-section',
    lg: 'gap-6',
} as const;

function resolveSpanClasses<T extends number>(
    span: T | Partial<Record<Breakpoint, T>> | undefined,
    classMap: Record<Breakpoint, Record<T, string>>,
): string[] {
    if (span === undefined) {
        return [];
    }

    if (typeof span === 'number') {
        return [classMap.base[span]];
    }

    return (Object.entries(span) as [Breakpoint, T][]).map(([breakpoint, value]) => classMap[breakpoint][value]);
}

export interface GridProps extends ComponentProps<'div'> {
    gap?: keyof typeof gapClasses;
    /**
     * Animates children in one after another on mount. `true` uses a 25ms step;
     * pass a number for a custom step in milliseconds.
     */
    stagger?: boolean | number;
}

/** Later items share the last delay so long grids do not feel slow. */
const MAX_STAGGERED_ITEMS = 6;

function applyStagger(children: ReactNode, stepInMilliseconds: number): ReactNode {
    return Children.toArray(children).map((child, index) => {
        if (!isValidElement<{ className?: string; style?: CSSProperties }>(child)) {
            return child;
        }

        const delay = Math.min(index, MAX_STAGGERED_ITEMS) * stepInMilliseconds;

        return cloneElement(child, {
            className: cn('animate-enter', child.props.className),
            style: { '--enter-delay': `${delay}ms`, ...child.props.style } as CSSProperties,
        });
    });
}

/**
 * Finance Core 12-column layout grid.
 */
export function Grid({ gap = 'md', stagger = false, className, children, ...props }: GridProps) {
    const staggerStep = stagger === true ? 25 : stagger || 0;

    return (
        <div className={cn('grid grid-cols-12', gapClasses[gap], className)} {...props}>
            {staggerStep > 0 ? applyStagger(children, staggerStep) : children}
        </div>
    );
}

export interface GridItemProps extends ComponentProps<'div'> {
    /** Column span, either a single value or per breakpoint. Defaults to full width. */
    span?: ResponsiveColumnSpan;
    rowSpan?: ResponsiveRowSpan;
}

export function GridItem({ span = 12, rowSpan, className, ...props }: GridItemProps) {
    return (
        <div
            className={cn('min-w-0', resolveSpanClasses(span, columnSpanClasses), resolveSpanClasses(rowSpan, rowSpanClasses), className)}
            {...props}
        />
    );
}

Grid.Item = GridItem;

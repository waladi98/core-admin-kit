import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';

export interface BreadcrumbEntry {
    title: string;
    href?: string;
    icon?: LucideIcon;
}

export interface BreadcrumbProps {
    items: BreadcrumbEntry[];
    className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    const Icon = item.icon;
                    const content = (
                        <>
                            {Icon && <Icon className="size-4 shrink-0" />}
                            {item.title}
                        </>
                    );

                    return (
                        <Fragment key={`${item.title}-${index}`}>
                            <li className="inline-flex items-center">
                                {isLast || !item.href ? (
                                    <span
                                        aria-current={isLast ? 'page' : undefined}
                                        className={cn('inline-flex items-center gap-1.5', isLast ? 'text-ink font-medium' : 'text-ink-muted')}
                                    >
                                        {content}
                                    </span>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className="text-ink-muted hover:text-ink inline-flex items-center gap-1.5 transition-colors"
                                    >
                                        {content}
                                    </Link>
                                )}
                            </li>
                            {!isLast && (
                                <li role="presentation" aria-hidden="true" className="text-ink-subtle">
                                    /
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}

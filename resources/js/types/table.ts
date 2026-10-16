export type SortDirection = 'asc' | 'desc';

export interface TableSort {
    key: string;
    direction: SortDirection;
}

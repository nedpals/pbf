import { ComparisonOp, ContainerOp, LogicalOp } from "./ops";

export type FilterValue = number | boolean | string | Date | null;

export interface ComparisonFilter {
    field: string
    op: ComparisonOp
    value: FilterValue
    meta?: Record<string, any>
}

export interface LogicalFilter {
    lhs: Filter
    op: LogicalOp
    rhs: Filter
    meta?: Record<string, any>
}

export interface ContainerFilter {
    op: ContainerOp
    filter: Filter
    meta?: Record<string, any>
}

export type Filter = ComparisonFilter | LogicalFilter | ContainerFilter;

export type MaybeFilter<T extends Filter> = T | null;

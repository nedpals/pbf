import { ComparisonFilter, ContainerFilter, Filter, FilterValue, LogicalFilter, MaybeFilter } from "./filter";
import { ComparisonOp, ContainerOp, LogicalOp, CONTAINER_OPS, INVERSE_OPS, LOGICAL_OPS } from "./ops";

type Falsey = null | undefined | 0 | "" | false;
type MaybeMaybeFilter<T extends Filter = Filter> = MaybeFilter<T> | Falsey;

export type MultipleFilterBuilder = {
    (...exprs: Filter[]): LogicalFilter
    maybe: (...exprs: MaybeMaybeFilter[]) => MaybeFilter<LogicalFilter>
}

function buildLogicalFilter(ops: LogicalOp): MultipleFilterBuilder {
    const maybeBuilderFn = (...exprs: MaybeMaybeFilter[]) => {
        const filtered = exprs.filter(Boolean) as Filter[];
        if (filtered.length === 0) return null;

        let expr = {op: ops} as LogicalFilter;

        for (let i = 0; i < filtered.length; i++) {
            let fExpr = filtered[i];

            const isLogical = fExpr.op in LOGICAL_OPS;
            // if (isLogical) {
            //     fExpr = fExpr!;
            // }

            if (!expr.lhs) {
                expr.lhs = fExpr;
                continue;
            }

            if (expr.lhs && expr.rhs) {
                const oldExpr = expr;
                expr = {
                    lhs: isLogical ? oldExpr : par(oldExpr)!,
                    op: ops,
                } as LogicalFilter;
            }

            expr.rhs = fExpr;
        }

        return expr;
    }

    const builderFn = <MultipleFilterBuilder>((...exprs: Filter[]): LogicalFilter => maybeBuilderFn(...exprs)!)
    builderFn.maybe = maybeBuilderFn;
    return builderFn;
}

export const and = buildLogicalFilter('and');
export const or = buildLogicalFilter('or');

export type SingleFilterBuilder<I extends Filter = Filter, O extends Filter = I> = {
    (expr: I): O
    maybe: (expr: MaybeMaybeFilter<I>) => MaybeFilter<O>
}

function singleFilterBuilder<
    I extends Filter,
    O extends Filter = I
>(builderFn: (filter: I) => O): SingleFilterBuilder<I, O> {
    const maybeBuilderFn = (filter: MaybeMaybeFilter<I>): MaybeFilter<O> => {
        if (!filter) {
            return null;
        }
        return builderFn(filter);
    }

    const _builderFn = builderFn as SingleFilterBuilder<I, O>;
    _builderFn.maybe = maybeBuilderFn;
    return _builderFn;
}

function buildContainerFilter(op: ContainerOp) {
    return singleFilterBuilder((filter): ContainerFilter => {
        if ('filter' in filter && filter.op in CONTAINER_OPS) {
            return filter;
        }
        return {op, filter};
    })
}

export const par = buildContainerFilter('par');

export const not = singleFilterBuilder(<T extends Filter>(filter: T): T => {
    if ('op' in filter && 'filter' in filter) {
        return filter;
    } else if ('field' in filter) {
        return {
            ...filter,
            op: INVERSE_OPS[filter.op]
        }
    }

    return {
        ...filter,
        lhs: not(filter.lhs),
        op: INVERSE_OPS[filter.op],
        rhs: not(filter.rhs)
    }
})

export type ComparisonFilterBuilder = {
    (field: string, value: FilterValue): ComparisonFilter
    either: (field: string, values: FilterValue[]) => LogicalFilter
    maybe: (field: string, values: FilterValue | Falsey) => MaybeFilter<ComparisonFilter>
    maybeEither: (field: string, values: (FilterValue | Falsey)[]) => MaybeFilter<LogicalFilter>
}

function buildComparisonOp(op: ComparisonOp) {
    const builderFn = <ComparisonFilterBuilder>((field: string, value: FilterValue): ComparisonFilter => {
        return {op, field, value};
    });

    const maybeBuilderFn = (field: string, value: FilterValue | Falsey): MaybeFilter<ComparisonFilter> => {
        if (!value) {
            return null;
        }
        return builderFn(field, value);
    };

    const maybeEitherBuilderFn = (field: string, values: (FilterValue | Falsey)[]) => {
        return or.maybe(...values.map(v => maybeBuilderFn(field, v)));
    }

    builderFn.maybe = maybeBuilderFn;
    builderFn.either = (field: string, values: FilterValue[]) => maybeEitherBuilderFn(field, values)!;
    builderFn.maybeEither = maybeEitherBuilderFn;
    return builderFn;
}

export const eq = buildComparisonOp('eq');
export const gt = buildComparisonOp('gt');
export const gte = buildComparisonOp('gte');
export const lt = buildComparisonOp('lt');
export const lte = buildComparisonOp('lte');
export const like = buildComparisonOp('like');
export const any = buildComparisonOp('any');
export const anygt = buildComparisonOp('anygt');
export const anygte = buildComparisonOp('anygte');
export const anylt = buildComparisonOp('anylt');
export const anylte = buildComparisonOp('anylte');
export const anylike = buildComparisonOp('anylike');
export const notEmpty = (column: string) => not(eq(column, ''));


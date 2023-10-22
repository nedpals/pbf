export type ContainerOp = keyof typeof CONTAINER_OPS;
export type LogicalOp = keyof typeof LOGICAL_OPS;
export type ComparisonOp = keyof typeof COMPARISON_OPS;
export type FilterOp = ComparisonOp | LogicalOp | ContainerOp;

export const CONTAINER_OPS = {
    par: '' // (expr)
} as const;

export const LOGICAL_OPS = {
    and: '&&',
    or: '||'
} as const;

export const COMPARISON_OPS = {
    eq: '=',
    neq: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: '~',
    nlike: '!~',
    any: '?=',
    nany: '?!=',
    anygt: '?>',
    anygte: '?>=',
    anylt: '?<',
    anylte: '?<=',
    anylike: '?~',
    nanylike: '?!~',
} as const;

export const INVERSE_OPS: Record<FilterOp, FilterOp> = {
    par: 'par',
    and: 'or',
    or: 'and',
    eq: 'neq',
    gt: 'lte',
    gte: 'lt',
    lt: 'gte',
    lte: 'gt',
    like: 'nlike',
    any: 'nany',
    anygt: 'anylte',
    anygte: 'anylt',
    anylt: 'anygte',
    anylte: 'anygt',
    anylike: 'nanylike',
    neq: 'eq',
    nany: 'any',
    nanylike: 'anylike',
    nlike: 'like',
} as const;

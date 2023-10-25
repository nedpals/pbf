import { par } from "./builder";
import { Filter, MaybeFilter } from "./filter";
import { COMPARISON_OPS, LOGICAL_OPS } from "./ops";
import { RAW_FIELD_REGEX } from "./parser";

const fieldRegex = new RegExp("^" + RAW_FIELD_REGEX + "$");

export function wrapValue(value: unknown): string | null {
    if (value === null) {
        return "null";
    } else if (value instanceof Date) {
        return JSON.stringify(value.toISOString().replace('T', ' '));
    }
    return JSON.stringify(value);
}

export function stringifyFilter(filter: MaybeFilter<Filter>): string {
    if (!filter) {
        return '';
    }

    if ('filter' in filter) {
        const wrappedFilter = stringifyFilter(filter.filter);
        return `(${wrappedFilter})`;
    } else if ('field' in filter) {
        const value = wrapValue(filter.value);
        if (!fieldRegex.test(filter.field)) {
            throw new Error(`Invalid field: ${filter.field}`);
        }
        return `${filter.field} ${COMPARISON_OPS[filter.op]} ${value}`;
    }

    const lhs = stringifyFilter('lhs' in filter.lhs ? par(filter.lhs) : filter.lhs);
    const rhs = stringifyFilter('lhs' in filter.rhs ? par(filter.rhs) : filter.rhs);
    return `${lhs} ${LOGICAL_OPS[filter.op]} ${rhs}`;
}

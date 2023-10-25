import { par } from "./builder";
import { ComparisonFilter, Filter, FilterValue, LogicalFilter } from "./filter";
import { COMPARISON_OPS, ComparisonOp, LOGICAL_OPS, LogicalOp } from "./ops";

// Logical filter
const ESCAPED_LOGICAL_FILTER_SYM = Object.values(LOGICAL_OPS).map((v) => v.replace('||', '\\|\\|'));

// Comparison filter
const RAW_FIELD_REGEX = '@?\\w+(?:\\.\\w+)*(?:\:[a-z_]+)?';
const ESCAPED_COMPARISON_FILTER_SYM = Object.values(COMPARISON_OPS)
    .sort((a, b) => a.length < b.length ? 1 : a.length === b.length ? 0 : -1)
    .map((v) => v.replace('?', '\\?'));

const RAW_STRING_VALUE_REGEX = `".+"|'.+'`;
const RAW_NUMBER_VALUE_REGEX = '[+-]?[0-9]*[.]?[0-9]+';
const RAW_BOOLEAN_VALUE_REGEX = 'true|false';
const RAW_NULL_VALUE_REGEX = 'null';
const RAW_PLACEHOLDER_VALUE_REGEX = '\\{:\\S+\\}';

// Container filter
const RAW_CONTAINER_FILTER_REGEX = `\\(|\\)`;

// Lexer
const OP_TOKENS = [ESCAPED_LOGICAL_FILTER_SYM, ESCAPED_COMPARISON_FILTER_SYM, RAW_CONTAINER_FILTER_REGEX].map(s => Array.isArray(s) ? s.join('|') : s);
const VALUE_TOKENS = [RAW_PLACEHOLDER_VALUE_REGEX, RAW_BOOLEAN_VALUE_REGEX, RAW_NULL_VALUE_REGEX, RAW_NUMBER_VALUE_REGEX, RAW_FIELD_REGEX, RAW_STRING_VALUE_REGEX];

const TOKENS = [
    ...OP_TOKENS,
    ...VALUE_TOKENS
];

const TOKEN_KINDS = {
    '-2': 'eof',
    '-1': 'unknown',
    1: 'logical_op',
    2: 'comparison_op',
    3: 'container_op',
    4: 'placeholder',
    5: 'boolean',
    6: 'null',
    7: 'number',
    8: 'field',
    9: 'string',
} as const;

const newLexer = () => new RegExp(TOKENS.map(tk => `(${tk})`).join('|'), "g");

interface Token {
    value: string
    kind: typeof TOKEN_KINDS[keyof typeof TOKEN_KINDS]
}

interface Parser {
    input: string
    lexer: RegExp
    index: number
    params: Record<string, FilterValue>

    prevToken: Token | null
    currentToken: Token | null
    nextToken: Token | null

    consume(kind?: Token['kind'] | Token['kind'][], expV?: string): Token
    next(): Token | null
}

function createParser(input: string, params: Record<string, FilterValue>): Parser {
    return {
        input,
        lexer: newLexer(),
        index: 0,
        prevToken: null,
        currentToken: null,
        nextToken: null,
        params,

        consume(expected, expV) {
            const currentToken = this.currentToken;
            if (Array.isArray(expected)) {
                if (!currentToken) {
                    throw new Error(`Expected either ${expected.join(', ')}. Got null`);
                } else if (!expected.includes(currentToken.kind)) {
                    throw new Error(`Expected either ${expected.join(', ')}. Got ${currentToken.value} (${currentToken.kind})`);
                }
            } else if (expected) {
                if (!currentToken) {
                    throw new Error(`Expected ${expected}. Got null`);
                } else if (expected !== currentToken.kind) {
                    throw new Error(`Expected ${expected}. Got ${currentToken.value} (${currentToken.kind})`);
                }
            }
            if (expV && currentToken && expV !== currentToken.value) {
                throw new Error(`Expected ${expV}. Got ${currentToken.value} (${currentToken.kind})`);
            }
            this.next();
            return currentToken!;
        },

        next() {
            const tokens = this.lexer.exec(input);
            this.prevToken = this.currentToken;
            this.currentToken = this.nextToken;
            if (tokens) {
                for (let i = 1; i < tokens.length; i++) {
                    if (!tokens[i]) {
                        continue;
                    }

                    // Checks if there is any skipped characters from the last position.
                    // If present, return a null token.
                    const pos = this.input.indexOf(tokens[i], this.index);
                    if (pos > this.index && pos - this.index >= 1) {
                        const gap = this.input.substring(this.index, pos);
                        if (gap.indexOf(" ") === -1 || (gap.indexOf(" ") !== -1 && !gap.endsWith(" "))) {
                            this.nextToken = null;
                            break;
                        }
                    }

                    this.nextToken = {
                        kind: TOKEN_KINDS[i as keyof typeof TOKEN_KINDS],
                        value: tokens[i]
                    }

                    this.index = pos + tokens[i].length;
                    break;
                }
            } else {
                this.index++;
                this.nextToken = null;
            }
            return this.currentToken;
        },
    }
}

function parseFilterCtx(p: Parser): Filter {
    if (!p.currentToken) {
        throw new Error(`Invalid filter: ${p.input}`);
    }

    switch (p.currentToken.kind) {
    case "field":
        return parseComparisonFilter(p);
    case "container_op":
        return parseContainerFilter(p);
    default:
        throw new Error(`Invalid token: ${p.currentToken.value} (${p.currentToken.kind})`)
    }
}

function parseComparisonFilter(p: Parser): Filter {
    const field = p.consume("field");
    const opSym = p.consume("comparison_op");
    const op = Object.keys(COMPARISON_OPS).find(op => COMPARISON_OPS[op as ComparisonOp] === opSym.value);
    if (!op) {
        throw new Error('Unexpected error happened while parsing logical filter.');
    }

    const rawValue = p.consume(["boolean", "field", "string", "number", "null", "placeholder"]);
    let value: FilterValue;

    switch (rawValue.kind) {
    case "placeholder":
        const paramName = rawValue.value.substring(2, rawValue.value.length - 1);
        value = p.params[paramName] ?? null;
        break;
    case "field":
        value = rawValue.value;
        break;
    case "string":
        if (rawValue.value.startsWith('\'') && rawValue.value.endsWith('\'')) {
            const singleOpeningIdx = rawValue.value.indexOf('\'');
            const singleClosingIdx = rawValue.value.lastIndexOf('\'')
            value = rawValue.value.substring(singleOpeningIdx + 1, singleClosingIdx);
            break;
        }
    default:
        value = JSON.parse(rawValue.value);
    }

    const filter: ComparisonFilter = {op: op as ComparisonOp, field: field.value, value};
    return parseLogicalIfPresent(p, filter);
}

function parseLogicalFilter(p: Parser, lhs: Filter): Filter {
    const opSymNode = p.consume('logical_op');
    const opSym = opSymNode.value;
    const rhs = parseFilterCtx(p);
    const op = Object.keys(LOGICAL_OPS).find(op => LOGICAL_OPS[op as LogicalOp] === opSym);
    if (!op) {
        throw new Error('Unexpected error happened while parsing logical filter.');
    }
    const filter: LogicalFilter = {op: op as LogicalOp, lhs, rhs};
    return parseLogicalIfPresent(p, filter);
}

// TODO: if there are 3-or-more filters, it should be left-prec'd instead of the right to match stringify behavior
function parseLogicalIfPresent(p: Parser, filter: Filter): Filter {
    if (p.currentToken && p.currentToken.kind === 'logical_op') {
        return parseLogicalFilter(p, 'lhs' in filter ? par(filter) : filter);
    }
    return filter;
}

function parseContainerFilter(p: Parser): Filter {
    p.consume('container_op', '(');
    let filter = parseFilterCtx(p);
    p.consume('container_op', ')');
    filter = par(filter);
    return parseLogicalIfPresent(p, filter);
}

export function parseFilter(filterStr: string, params: Record<string, FilterValue> = {}): Filter {
    const parser = createParser(filterStr.trim(), params);
    parser.consume();
    parser.consume();
    return parseFilterCtx(parser);
}

export { RAW_FIELD_REGEX };
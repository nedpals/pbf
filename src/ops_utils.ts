import { COMPARISON_OPS, CONTAINER_OPS, ComparisonOp, ContainerOp, FilterOp, LOGICAL_OPS, LogicalOp } from "./ops";

function isOpA<O extends FilterOp, M extends object = {}>(mp: M) {
    return (op: string): op is O => {
        if (op in mp) {
            return true;
        }
        return false;
    }
}

export const isOpContainer = isOpA<ContainerOp>(CONTAINER_OPS);
export const isOpLogical = isOpA<LogicalOp>(LOGICAL_OPS);
export const isOpComparison = isOpA<ComparisonOp>(COMPARISON_OPS);

export function getSymbolByOp(op: string): string {
    if (isOpContainer(op)) {
        return CONTAINER_OPS[op];
    } else if (isOpLogical(op)) {
        return LOGICAL_OPS[op];
    } else if (isOpComparison(op)) {
        return COMPARISON_OPS[op];
    }
    return '';
}

export function getOpBySymbol(sym: string): string {
    for (const op in CONTAINER_OPS) {
        if (CONTAINER_OPS[op as keyof typeof CONTAINER_OPS] == sym) {
            return op;
        }
    }

    for (const op in LOGICAL_OPS) {
        if (LOGICAL_OPS[op as keyof typeof LOGICAL_OPS] == sym) {
            return op;
        }
    }

    for (const op in COMPARISON_OPS) {
        if (COMPARISON_OPS[op as keyof typeof COMPARISON_OPS] == sym) {
            return op;
        }
    }

    return "";
}

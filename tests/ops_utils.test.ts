import { expect, test } from "vitest";
import { isOpComparison, isOpContainer, isOpLogical, getSymbolByOp, getOpBySymbol } from "../src/ops_utils";
import { COMPARISON_OPS, CONTAINER_OPS, LOGICAL_OPS } from "../src/ops";

test("check op using isOpContainer", () => {
    for (const op in CONTAINER_OPS) {
        expect(isOpContainer(op)).toBe(true);
    }
});

test("invalid op in isOpContainer must be false", () => {
    expect(isOpContainer("=")).toBe(false);
    expect(isOpContainer("eq")).toBe(false);
    expect(isOpContainer("")).toBe(false);
    expect(isOpContainer("abcdef")).toBe(false);
    expect(isOpContainer("and")).toBe(false);
});

test("check op using isOpLogical", () => {
    for (const op in LOGICAL_OPS) {
        expect(isOpLogical(op)).toBe(true);
    }
});

test("invalid op in isOpLogical must be false", () => {
    expect(isOpLogical(">>>")).toBe(false);
    expect(isOpLogical("par")).toBe(false);
    expect(isOpLogical("")).toBe(false);
    expect(isOpLogical("abcdef")).toBe(false);
    expect(isOpLogical("gte")).toBe(false);
});

test("check op using isOpComparison", () => {
    for (const op in COMPARISON_OPS) {
        expect(isOpComparison(op)).toBe(true);
    }
});

test("invalid op in isOpComparison must be false", () => {
    expect(isOpComparison("~")).toBe(false);
    expect(isOpComparison("par")).toBe(false);
    expect(isOpComparison("")).toBe(false);
    expect(isOpComparison("abcdef")).toBe(false);
    expect(isOpComparison("or")).toBe(false);
});

test("return appropriate symbol with getSymbolByOp", () => {
    for (const op in CONTAINER_OPS) {
        expect(getSymbolByOp(op)).toBe(CONTAINER_OPS[op]);
    }

    for (const op in LOGICAL_OPS) {
        expect(getSymbolByOp(op)).toBe(LOGICAL_OPS[op]);
    }

    for (const op in COMPARISON_OPS) {
        expect(getSymbolByOp(op)).toBe(COMPARISON_OPS[op]);
    }
});

test("return empty string with getSymbolByOp invalid op", () => {
    expect(getSymbolByOp("||")).toBe("");
    expect(getSymbolByOp("&&")).toBe("");
    expect(getSymbolByOp("")).toBe("");
    expect(getSymbolByOp("123")).toBe("");
    expect(getSymbolByOp("eqqq")).toBe("");
});

test("return appropriate op with getOpBySymbol", () => {
    for (const op in CONTAINER_OPS) {
        expect(getOpBySymbol(CONTAINER_OPS[op])).toBe(op);
    }

    for (const op in LOGICAL_OPS) {
        expect(getOpBySymbol(LOGICAL_OPS[op])).toBe(op);
    }

    for (const op in COMPARISON_OPS) {
        expect(getOpBySymbol(COMPARISON_OPS[op])).toBe(op);
    }
});

test("return empty string with getOpBySymbol invalid op", () => {
    expect(getOpBySymbol("or")).toBe("");
    expect(getOpBySymbol("aaaaa")).toBe("");
    expect(getOpBySymbol("  &&")).toBe("");
    expect(getOpBySymbol("123")).toBe("");
    expect(getOpBySymbol("eqqq")).toBe("");
});

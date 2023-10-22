import { expect, test } from "vitest";
import * as pbf from "../src";

test('stringify an eq comparison filter', () => {
    expect(pbf.stringify(pbf.eq('a', 1))).toBe('a = 1');
});

test('stringify an neq comparison filter', () => {
    expect(pbf.stringify(pbf.not(pbf.eq('a', 1)))).toBe('a != 1');
});

test('stringify a gt comparison filter', () => {
    expect(pbf.stringify(pbf.gt('a', 1))).toBe('a > 1');
});

test('stringify a gte comparison filter', () => {
    expect(pbf.stringify(pbf.gte('a', 1))).toBe('a >= 1');
});

test('stringify a lt comparison filter', () => {
    expect(pbf.stringify(pbf.lt('a', 1))).toBe('a < 1');
});

test('stringify a lte comparison filter', () => {
    expect(pbf.stringify(pbf.lte('a', 1))).toBe('a <= 1');
});

test('stringify a like comparison filter', () => {
    expect(pbf.stringify(pbf.like('a', 1))).toBe('a ~ 1');
});

test('stringify an any comparison filter', () => {
    expect(pbf.stringify(pbf.any('a', 1))).toBe('a ?= 1');
});

test('stringify an anygt comparison filter', () => {
    expect(pbf.stringify(pbf.anygt('a', 1))).toBe('a ?> 1');
});

test('stringify an anygte comparison filter', () => {
    expect(pbf.stringify(pbf.anygte('a', 1))).toBe('a ?>= 1');
});

test('stringify an anylt comparison filter', () => {
    expect(pbf.stringify(pbf.anylt('a', 1))).toBe('a ?< 1');
});

test('stringify an anylte comparison filter', () => {
    expect(pbf.stringify(pbf.anylte('a', 1))).toBe('a ?<= 1');
});

test('stringify an anylike comparison filter', () => {
    expect(pbf.stringify(pbf.anylike('a', 1))).toBe('a ?~ 1');
});

test('stringify a comparison filter with string', () => {
    expect(pbf.stringify(pbf.eq('name', "Bob"))).toBe('name = "Bob"');
});

test('stringify a either-variant comparison filter with string', () => {
    expect(pbf.stringify(pbf.eq.either('name', ["Bob", "John", "James"]))).toBe('(name = "Bob" || name = "John") || name = "James"');
});

test('stringify a maybeeither-variant comparison filter with string', () => {
    expect(pbf.stringify(pbf.eq.maybeEither('name', ["Bob", false && "John", 0, "James"]))).toBe('name = "Bob" || name = "James"');
});

test('stringify a comparison filter with number', () => {
    expect(pbf.stringify(pbf.eq('a', 1))).toBe('a = 1');
    expect(pbf.stringify(pbf.eq('pi', 3.1415))).toBe('pi = 3.1415');
});

test('stringify a comparison filter with boolean', () => {
    expect(pbf.stringify(pbf.eq('is_cute', true))).toBe('is_cute = true');
    expect(pbf.stringify(pbf.eq('is_small', false))).toBe('is_small = false');
});

test('stringify a comparison filter with Date', () => {
    expect(pbf.stringify(pbf.eq('created', new Date('2020/01/01')))).toBe('created = "2019-12-31 16:00:00.000Z"');
});

test('stringify an and logical filter', () => {
    expect(pbf.stringify(pbf.and(pbf.any('a', 1), pbf.lt('b', 2)))).toBe('a ?= 1 && b < 2');
});

test('stringify an or logical filter', () => {
    expect(pbf.stringify(pbf.or(pbf.gt('b', 1), pbf.anylike('c', 2)))).toBe('b > 1 || c ?~ 2');
});

test('stringify multiple filters into a logical filter', () => {
    expect(pbf.stringify(pbf.or(pbf.lte('a', 1), pbf.gt('b', 1), pbf.anylike('c', 2)))).toBe('(a <= 1 || b > 1) || c ?~ 2');
});

test('stringify a nested logical filter (left)', () => {
    expect(pbf.stringify(pbf.and(pbf.or(pbf.eq('a', 1), pbf.gt('b', 1)), pbf.anylike('c', 2)))).toBe('(a = 1 || b > 1) && c ?~ 2');
});

test('stringify a nested logical filter (right)', () => {
    expect(pbf.stringify(pbf.and(pbf.eq('a', 1), pbf.or(pbf.gt('b', 1), pbf.anylike('c', 2))))).toBe('a = 1 && (b > 1 || c ?~ 2)');
});

test('stringify a nested logical filter (both)', () => {
    expect(pbf.stringify(pbf.and(pbf.or(pbf.eq('a', 1), pbf.gt('b', 1)), pbf.or(pbf.gt('b', 1), pbf.anylike('c', 2))))).toBe('(a = 1 || b > 1) && (b > 1 || c ?~ 2)');
});

test('stringify a container filter', () => {
    expect(pbf.stringify(pbf.par(pbf.eq('name', "Bob")))).toBe('(name = "Bob")');
});

test('stringify from pocketbase repo example', () => {
    expect(pbf.stringify(pbf.and(
        pbf.eq('status', true),
        pbf.gt('created', new Date('2022-08-01 10:00:00Z'))
    ))).toBe('status = true && created > "2022-08-01 10:00:00.000Z"');
});

test('stringify a maybe-variant logical operator', () => {
    expect(pbf.stringify(pbf.and.maybe(
        false,
        null,
        pbf.eq('d', 1),
        0,
        pbf.not(pbf.eq('e', 1)),
    ))).toBe('d = 1 && e != 1')
});

test('stringify an empty maybe-variant logical operator', () => {
    expect(pbf.stringify(pbf.and.maybe(
        false,
        null,
        0,
    ))).toBe('');
});

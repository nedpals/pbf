import { expect, test } from "vitest";
import * as pbf from "../src";

test("parse an eq comparison filter", () => {
    expect(pbf.parse("a = 1")).toStrictEqual(pbf.eq("a", 1));
});

test("parse a gt comparison filter", () => {
    expect(pbf.parse("a > 1")).toStrictEqual(pbf.gt("a", 1));
});

test("parse a gte comparison filter", () => {
    expect(pbf.parse("a >= 1")).toStrictEqual(pbf.gte("a", 1));
});

test("parse a lt comparison filter", () => {
    expect(pbf.parse("a < 1")).toStrictEqual(pbf.lt("a", 1));
});

test("parse a lte comparison filter", () => {
    expect(pbf.parse("a <= 1")).toStrictEqual(pbf.lte("a", 1));
});

test("parse a like comparison filter", () => {
    expect(pbf.parse("a ~ 1")).toStrictEqual(pbf.like("a", 1));
});

test("parse an any comparison filter", () => {
    expect(pbf.parse("a ?= 1")).toStrictEqual(pbf.any("a", 1));
});

test("parse an anygt comparison filter", () => {
    expect(pbf.parse("a ?> 1")).toStrictEqual(pbf.anygt("a", 1));
});

test("parse an anygte comparison filter", () => {
    expect(pbf.parse("a ?>= 1")).toStrictEqual(pbf.anygte("a", 1));
});

test("parse an anylt comparison filter", () => {
    expect(pbf.parse("a ?< 1")).toStrictEqual(pbf.anylt("a", 1));
});

test("parse an anylte comparison filter", () => {
    expect(pbf.parse("a ?<= 1")).toStrictEqual(pbf.anylte("a", 1));
});

test("parse an anylike comparison filter", () => {
    expect(pbf.parse("a ?~ 1")).toStrictEqual(pbf.anylike("a", 1));
});

test("parse a neq comparison filter", () => {
    expect(pbf.parse("a != 1")).toStrictEqual(pbf.not(pbf.eq("a", 1)));
});

test("parse a comparison filter with double quoted string value", () => {
    expect(pbf.parse('a = "b"')).toStrictEqual(pbf.eq("a", "b"));
});

test("parse a comparison filter with single quoted string value", () => {
    expect(pbf.parse("a = 'b'")).toStrictEqual(pbf.eq("a", "b"));
});

test("parse a comparison filter with boolean as value (true)", () => {
    expect(pbf.parse("a = true")).toStrictEqual(pbf.eq("a", true));
});

test("parse a comparison filter with boolean as value (true)", () => {
    expect(pbf.parse("a = false")).toStrictEqual(pbf.eq("a", false));
});

test("parse a comparison filter with number as value (integer)", () => {
    expect(pbf.parse("a = 1")).toStrictEqual(pbf.eq("a", 1));
});

test("parse a comparison filter with number as value (float)", () => {
    expect(pbf.parse("pi = 3.1415")).toStrictEqual(pbf.eq("pi", 3.1415));
});

test("parse a comparison filter with null value", () => {
    expect(pbf.parse("a = null")).toStrictEqual(pbf.eq("a", null));
});

test("parse a comparison filter with placeholder value", () => {
    expect(pbf.parse("title ~ {:title}", { title: "example" })).toStrictEqual(pbf.like("title", "example"));
});

test("parse a comparison filter with modifier", () => {
    expect(pbf.parse("@request.data.role:isset = false"))
        .toStrictEqual(pbf.eq("@request.data.role:isset", false));
});

test("parse a logical filter (and)", () => {
    expect(pbf.parse("a = '1' && b >= 2")).toStrictEqual(pbf.and(pbf.eq("a", '1'), pbf.gte("b", 2)));
});

test("parse a logical filter (or)", () => {
    expect(pbf.parse("a = 1 || b ~ 'hey'")).toStrictEqual(pbf.or(pbf.eq("a", 1), pbf.like("b", "hey")));
});

test("parse a 3-item logical filter", () => {
    expect(pbf.parse("a = 1 || a = 2 || a > 3")).toStrictEqual(
        pbf.or(
            pbf.eq("a", 1),
            pbf.or(
                pbf.eq("a", 2),
                pbf.gt("a", 3)
            )
        )
    );
});

test("parse a nested logical filter (parenthesized left)", () => {
    expect(pbf.parse("(a = 1 || a = 2) && b ~ 'hey'")).toStrictEqual(
        pbf.and(
            pbf.par(pbf.or(pbf.eq("a", 1), pbf.eq("a", 2))),
            pbf.like("b", "hey")
        )
    );
});

test("parse a nested logical filter (parenthesized right)", () => {
    expect(pbf.parse("a = 1 || (a = 2 && b ~ 'hey')")).toStrictEqual(
        pbf.or(
            pbf.eq("a", 1),
            pbf.par(pbf.and(pbf.eq("a",  2), pbf.like("b", "hey"))),
        )
    );
});

test("parse a nested logical filter (both parenthesized)", () => {
    expect(pbf.parse("(a = 1 || a = 2) && (b ~ 'hey' && c != 1)")).toStrictEqual(
        pbf.and(
            pbf.par(pbf.or(pbf.eq("a", 1), pbf.eq("a", 2))),
            pbf.par(pbf.and(pbf.like("b", "hey"), pbf.not(pbf.eq("c", 1))))
        )
    );
});

test("parse a parenthesized container filter", () => {
    expect(pbf.parse("(a = 1)")).toStrictEqual(pbf.par(pbf.eq("a", 1)));
});

test("parse a complex filter with empty strings", () => {
    expect(pbf.parse('(a ~ "" || b ~ "") || c ~ ""')).toStrictEqual(
        pbf.or(
            pbf.par(pbf.or(
                pbf.like("a", ""),
                pbf.like("b", "")
            )),
            pbf.like("c", "")
        )
    );
});

test("throw an error when parsing a comparison filter with dot", () => {
    expect(() => pbf.parse(". = 1")).toThrowError();
    expect(() => pbf.parse(".abc = 1")).toThrowError();
    expect(() => pbf.parse(". = .")).toThrowError();
    expect(() => pbf.parse("abc = .def")).toThrowError();
});

test("throw an error when parsing a comparison filter with @ only", () => {
    expect(() => pbf.parse("@ = 1")).toThrowError();
    expect(() => pbf.parse("abc = @")).toThrowError();
});

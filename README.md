# PBF
Library for serializing and deserializing [PocketBase](https://pocketbase.io) filter syntax.

## Key Features
* Supports all PocketBase filter operators and expressions
* Supports both Node and browser
* Provides a fluent and (almost) type-safe API for building filters
* Can be used to serialize and deserialize filters
* TypeScript-support

## Installation
You can easily install PBF using npm or yarn:
```bash
npm install pbf
```

or

```bash
yarn add pbf
```

## Usage
PBF makes it simple to work with PocketBase filter syntax. Here's a quick example of how to get started:

```typescript
import * as pbf from "@nedpals/pbf";
import PocketBase from "pocketbase";

const pb = new PocketBase("<pocketbase url>");

const result = await pb.collection('example').getList(1, 20, {
    filter: pbf.stringify(pbf.and(
        pbf.eq('status', true),
        pbf.gt('created', new Date("2022-08-01"))
    )) // status = true && created > "2022-08-01 10:00:00.000Z"
});
```

### Negating a filter
To negate a filter (eg. equals to not equal, and to or), you may use the `not` function. This not negate the value but only the operator used.

```typescript
import * as pbf from "@nedpals/pbf";

pbf.stringify(pbf.not(pbf.eq("is_repost", false))) // is_repost = false

```

### Conditional filter generation
In some instances you want to create a search filter with some of the filters conditionally enabled through [short-circuiting]([https://](https://www.educative.io/answers/what-are-javascript-short-circuiting-operators)). You can do this by adding the `.maybe` modifier before calling the operators. This will filter out any falsey values and output the appropriate filters.

```typescript
import * as pbf from "@nedpals/pbf";

pbf.stringify(pbf.and.maybe(
    false && pbf.eq('f', 4),
    null,
    pbf.eq('d', 1),
    0,
    pbf.not(pbf.eq('e', 1)),
)); // d = 1 && e != 1
```

### Comparing multiple values
Instead of repeating yourself writing multiple comparison filters of the same field, PBF provides an easy shortcut through the `either` modifier.

```typescript
import * as pbf from "@nedpals/pbf";

// shortcut for pbf.or(pbf.eq("size", "L"), pbf.eq("size", "XL"), pbf.eq("size", "XXL"))
pbf.stringify(pbf.eq.either("size", ["L", "XL", "XXL"])); // (size = "L" || size = "XL") || size = "XXL"
```

### Deserialize / parse raw filter strings
PBF also supports parsing raw filter strings into a proper PBF format. This is great when you want to parse from the URL search query or just want to build a PocketBase-like search experience:
```typescript
import * as pbf from "@nedpals/pbf";

const result = pbf.parse("title = 'example'"); // equivalent to eq("title", "example");

// You can also inject/bind values to placeholders
const resultB = pbf.parse("title = {:title}", { title: "Foo bar" }) // equivalent of eq("title", "Foo bar")
```

## Format
To make serializing/deserializing possible, PBF stores it as an object following a syntax tree format for distinguishing logical, comparison, and containerized/parenthesized filters.

```typescript
// Taken and modified from the source code for brevity
type FilterValue = number | boolean | string | Date | null;
type Filter = ComparisonFilter | LogicalFilter | ContainerFilter;
type Metadata = Record<string, any>

// eg. a = 1
interface ComparisonFilter {
    field: string
    op: Operator
    value: FilterValue
    meta?: Metadata
}

// eg. a > 1 && b = 2
interface LogicalFilter {
    lhs: Filter
    op: Operator
    rhs: Filter
    meta?: Metadata
}

// eg. (c = 3)
interface ContainerFilter {
    op: Operator
    filter: Filter
    meta?: Metadata
}
```

This also makes it easier to craft filters by hand especially when building dynamic facet-like filters:

```typescript
const filter: Filter = {
    op: "and",
    lhs: {
        op: "gte",
        field: "shoe_size",
        value: 20
    },
    rhs: {
        op: "eq",
        field: "color",
        value: "burgundy"
    }
}

pbf.stringify(filter) // shoe_size >= 20 && color = "burgundy"
```

## Differences with PocketBase
Starting with PocketBase JS SDK [0.19.0](https://github.com/pocketbase/js-sdk/commit/98b5fa014a27b88a6f25d39d741b10f821d0a24a), a new feature was added that allows filters to be built similarly to PBF. However, there are some key differences between the two approaches.

PocketBase only ensures that values are properly escaped and bound to the filter. The user is still responsible for constructing the filter syntax, which can be prone to mistakes. PBF, on the other hand, provides a more comprehensive solution by also providing an easy and extensive way to create complex search filters without worrying about the syntax.

PBF was also created as a one-off utility function before this feature was added to PocketBase.

## License
pbf is licensed under the [MIT License](LICENSE).

# Contributing
Contributions are welcome! Please feel free to open issues or pull requests.

## Submitting a pull request
- Fork it (https://github.com/nedpals/pbf/fork)
- Create your feature branch (git checkout -b my-new-feature)
- Commit your changes (git commit -am 'Add some feature')
- Push to the branch (git push origin my-new-feature)
- Create a new Pull Request

# Contributors
- [nedpals](https://github.com/nedpals) - creator and maintainer

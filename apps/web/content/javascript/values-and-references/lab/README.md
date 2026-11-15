# Lab 1.1: deepEqual, deepClone and structuredClone

About 60 minutes. You will write two functions that every JavaScript developer uses through a library (Node's `assert.deepStrictEqual`, Jest's and Vitest's `toEqual`, lodash's `cloneDeep`), and then check what the built-in `structuredClone` really keeps.

Work in `starter.js`. Run the tests from the repository root:

```sh
packages/trace/node_modules/.bin/vitest run --root apps/web/content/javascript/values-and-references/lab
```

The tests import `starter.js`. `solution.js` holds one full answer; open it only after you have tried each hint.

## Warm-up: a worked example

Read this function and answer the question after each numbered line before you read the answer.

```js
function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;                 // 1
  if (typeof a !== 'object' || a === null) return false;   // 2
  if (typeof b !== 'object' || b === null) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false; // 3
  return keys.every((k) => Object.hasOwn(b, k) && Object.is(a[k], b[k])); // 4
}
```

1. Why `Object.is` and not `===`? Answer: the lesson's SameValue rule. `NaN` should equal `NaN`, and `+0` should differ from `-0`.
2. Why test `a === null` after `typeof a !== 'object'`? Answer: `typeof null` is `"object"`, the first oddity from segment 3.
3. Why compare the number of keys? Answer: without it, `{ a: 1 }` would equal `{ a: 1, b: 2 }`, because every key of the first is in the second.
4. Why is this only *shallow*? Answer: `Object.is(a[k], b[k])` compares nested objects by identity. `shallowEqual({ t: [1] }, { t: [1] })` is `false`, because the two arrays are two objects.

`deepEqual` is this function with line 4 replaced by a recursive call, plus rules for the objects that keep their data somewhere other than own keys.

## Task 1: `deepEqual(a, b)` (completion)

The rules your function must follow. They match Node's `assert.deepStrictEqual` on every case the tests cover.

1. Primitives are compared with `Object.is` (SameValue). So `deepEqual(NaN, NaN)` is `true` and `deepEqual(0, -0)` is `false`. This part is written for you.
2. Two objects with different prototypes are never equal. An array is not equal to a plain object with the same keys, and a `Point` instance is not equal to `{ x: 1 }`.
3. Arrays are equal when they have the same length and deeply equal items at every index.
4. Dates are equal when `getTime()` gives the same number (compare with `Object.is`, so two invalid Dates are equal).
5. Maps are equal when they have the same size and, for every key of the first, the second has that key (by `Map.has`) with a deeply equal value. A consequence: an object key must be the *same* object in both Maps. So a Map with object keys is not `deepEqual` to its own `deepClone`, because the clone has new key objects. Node's `isDeepStrictEqual` matches object keys deeply instead; we keep the simpler rule.
6. Sets are equal when they have the same size and every member of the first has a partner in the second. A primitive member must be in the other set (`Set.has`). An object member must deeply equal a different, not yet used object member of the other set.
7. Other objects (plain objects and class instances) are equal when they have the same own enumerable string keys (`Object.keys`) and deeply equal values for each key. A missing key is not the same as a key that holds `undefined`.
8. Cycles: if the same pair of objects is already being compared further up, treat the pair as equal. This is what makes the function stop on `a.self = a`. It compares what you can reach by following properties, not the shape of the cycle: `a.self = a` and `b.self = { }` with `b.self.self = b.self` count as equal here, while Node's `isDeepStrictEqual` says they differ. Both choices are defensible; this one is the shortest to write.

### Hints for Task 1

1. Check the cheap facts first and leave early: prototypes, then the kind of object (`instanceof Date`, `Map`, `Set`, `Array.isArray`), then sizes or lengths. A `Date`, a `Map` and a `Set` have no own keys, so rule 7 alone would call every two of them equal.
2. For cycles, keep a `Map` from each left object to a `Set` of right objects that are being compared right now. Add the pair before you compare the children and remove it after, in a `finally` block. If the pair is already there, return `true`.
3. For Sets: build `unmatched` as the members of `y` that are not in `x`. Then for each member of `x`: if `y.has(member)`, continue. Otherwise find the index of an item in `unmatched` that is an object and `eq(member, item)`; if none, return `false`, else remove it with `splice` so it cannot be used twice.

## Task 2: `deepClone(value)` (Parsons, then extend)

Rules:

1. Primitives are returned as they are. They are immutable, so sharing them is safe.
2. Functions are returned as they are (shared). A function carries a reference to the place it was created (lesson 1.3), so copying its code would not copy what it can reach. `structuredClone` throws instead.
3. A `Date` becomes a new `Date` with the same time.
4. A `Map` becomes a new `Map`. Keys and values are cloned. A `Set` becomes a new `Set` with cloned members.
5. An array becomes a new array of the same length with cloned items.
6. Any other object becomes a new object with the **same prototype** (`Object.create(Object.getPrototypeOf(v))`), and each own enumerable string key is copied with `copy[key] = clone(v[key])`. This is a deliberate difference from `structuredClone`, which drops a class's prototype. Two limits you should know:
   - Keeping the prototype does not recreate private fields (`#count`). A cloned instance whose methods read a private field throws a `TypeError` when you call them.
   - A key literally named `"__proto__"` (for example from `JSON.parse('{"__proto__": {}}')`) is not copied as a property, because assigning to `copy["__proto__"]` changes the copy's prototype instead. `Object.defineProperty(copy, key, { value, writable: true, enumerable: true, configurable: true })` avoids this. The tests do not require it; try it as a stretch.
7. Every original object is copied exactly once. If it appears twice, both places get the same copy. A cycle in the original is a cycle in the clone.

**Part A, Parsons.** These lines make a working `deepClone` for plain objects and arrays. Three lines are distractors and do not belong. Put the rest in order inside `deepClone` in `starter.js` (you also need the closing braces).

```js
for (const key of Object.keys(v)) copy[key] = v[key];
const copies = new Map();
copies.set(v, copy);
return clone(value);
const copy = v;
if (copies.has(v)) return copies.get(v);
function clone(v) {
for (const key of Object.keys(v)) copy[key] = clone(v[key]);
const copy = { ...v };
if (!isObject(v) || typeof v === 'function') return v;
const copy = Array.isArray(v) ? new Array(v.length) : Object.create(Object.getPrototypeOf(v));
return copy;
```

The three distractors are three wrong models from the lesson. Name each one before you move on.

**Part B, extend.** Add `Date`, `Map` and `Set` (rules 3 and 4) so that all Task 2 tests pass.

### Hints for Task 2

1. The three distractors: `const copy = v` copies a reference (two arrows, one object). `const copy = { ...v }` is a shallow copy (nested objects stay shared). `copy[key] = v[key]` without `clone(...)` copies each nested reference, which is shallow again.
2. The order of two lines decides whether cycles work: `copies.set(v, copy)` must come **before** the loop that clones the children. If it comes after, a child that points back to `v` does not find a copy yet, clones `v` again, and the calls never end.
3. For Part B, put the `Date`, `Map` and `Set` cases after the `copies.has(v)` line and before the general case. Each one makes its empty copy, calls `copies.set(v, copy)` straight away, then fills it: `copy.set(clone(key), clone(item))` for a Map, `copy.add(clone(member))` for a Set.

## Task 3: what does `structuredClone` keep? (predict, then verify)

`structuredClone` is a deep copy built into browsers and Node. It is a host feature, not part of the JavaScript language itself. In `starter.js`, set each field of `structuredCloneFacts` to `true` or `false` **before** you run the tests. The tests then run `structuredClone` and check your predictions.

| Fact | Your prediction | Your `deepClone` |
|---|---|---|
| `keepsCycles` | | true (rule 7) |
| `keepsSharedReferences` | | true (rule 7) |
| `keepsClassPrototype` | | true (rule 6) |
| `copiesFunctions` (false means it throws) | | shares them (rule 2) |
| `keepsDates` | | true (rule 3) |
| `keepsSymbolKeys` | | false (`Object.keys` skips them) |

When all tests pass, write one sentence for each row where your `deepClone` and `structuredClone` differ: which behaviour would you want in a Redux store, and which when you send data to a Web Worker?

### Hints for Task 3

1. Segment 17 of the lesson ran `structuredClone` on a class instance and on a shared object. Start from those two answers.
2. MDN's page "The structured clone algorithm" has a section "Things that don't work with structured clone". Functions, the prototype chain, getters and setters are on it.
3. The supported types on the same page are listed by type, and Symbol is excluded from the primitives it supports. A symbol key is a property whose key is a symbol, so ask yourself whether the algorithm copies properties by string keys only.

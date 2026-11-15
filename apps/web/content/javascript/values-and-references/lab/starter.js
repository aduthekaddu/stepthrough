// Lab for lesson 1.1, Values and references. Read README.md first.
// Run the tests from the repo root:
//   packages/trace/node_modules/.bin/vitest run --root apps/web/content/javascript/values-and-references/lab

const isObject = (v) => (typeof v === 'object' && v !== null) || typeof v === 'function';

// Task 1 (completion). The primitive rule is done for you. Fill in the rest.
export function deepEqual(a, b) {
  const inProgress = new Map();

  function eq(x, y) {
    if (Object.is(x, y)) return true;
    if (!isObject(x) || !isObject(y)) return false;
    // TODO 1a: objects with different prototypes are never equal (an array is not a plain object).
    // TODO 1e: cycles. If the pair (x, y) is already being compared further up, return true.
    //          Otherwise record the pair, call compare(x, y), and remove the pair again.
    return compare(x, y);
  }

  function compare(x, y) {
    // TODO 1b: Dates. Equal when getTime() is the same (use Object.is).
    // TODO 1c: Maps and Sets. Same size, then entries or members (see README for the Set rule).
    // TODO 1d: arrays, then plain objects and class instances: same own keys, deeply equal values.
    return false;
  }

  return eq(a, b);
}

// Task 2 (Parsons, then extend). Put the README lines in order here, then add Date, Map and Set.
export function deepClone(value) {
  return value;
}

// Task 3. Predict each fact (true or false) before you run the tests.
export const structuredCloneFacts = {
  keepsCycles: undefined,
  keepsSharedReferences: undefined,
  keepsClassPrototype: undefined,
  copiesFunctions: undefined,
  keepsDates: undefined,
  keepsSymbolKeys: undefined,
};

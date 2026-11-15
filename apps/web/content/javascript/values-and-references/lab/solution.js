const isObject = (v) => (typeof v === 'object' && v !== null) || typeof v === 'function';

export function deepEqual(a, b) {
  const inProgress = new Map();

  function eq(x, y) {
    if (Object.is(x, y)) return true;
    if (!isObject(x) || !isObject(y)) return false;
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return false;

    // A pair already being compared further up is assumed equal; that is what lets a cycle end.
    if (inProgress.get(x)?.has(y)) return true;
    if (!inProgress.has(x)) inProgress.set(x, new Set());
    inProgress.get(x).add(y);
    try {
      return compare(x, y);
    } finally {
      inProgress.get(x).delete(y);
    }
  }

  function compare(x, y) {
    if (x instanceof Date) return Object.is(x.getTime(), y.getTime());
    if (typeof x === 'function') return false;
    if (x instanceof Map) {
      if (x.size !== y.size) return false;
      for (const [key, value] of x) {
        if (!y.has(key) || !eq(value, y.get(key))) return false;
      }
      return true;
    }
    if (x instanceof Set) {
      if (x.size !== y.size) return false;
      const unmatched = [...y].filter((member) => !x.has(member));
      for (const member of x) {
        if (y.has(member)) continue;
        const i = unmatched.findIndex((other) => isObject(member) && eq(member, other));
        if (i === -1) return false;
        unmatched.splice(i, 1);
      }
      return true;
    }
    if (Array.isArray(x)) {
      if (x.length !== y.length) return false;
      for (let i = 0; i < x.length; i++) if (!eq(x[i], y[i])) return false;
      return true;
    }
    const keys = Object.keys(x);
    if (keys.length !== Object.keys(y).length) return false;
    return keys.every((key) => Object.hasOwn(y, key) && eq(x[key], y[key]));
  }

  return eq(a, b);
}

export function deepClone(value) {
  const copies = new Map();

  function clone(v) {
    if (!isObject(v) || typeof v === 'function') return v;
    if (copies.has(v)) return copies.get(v);

    if (v instanceof Date) {
      const copy = new Date(v.getTime());
      copies.set(v, copy);
      return copy;
    }
    if (v instanceof Map) {
      const copy = new Map();
      copies.set(v, copy);
      for (const [key, item] of v) copy.set(clone(key), clone(item));
      return copy;
    }
    if (v instanceof Set) {
      const copy = new Set();
      copies.set(v, copy);
      for (const member of v) copy.add(clone(member));
      return copy;
    }
    // Register the copy before cloning children, so a child that points back finds it.
    const copy = Array.isArray(v) ? new Array(v.length) : Object.create(Object.getPrototypeOf(v));
    copies.set(v, copy);
    for (const key of Object.keys(v)) copy[key] = clone(v[key]);
    return copy;
  }

  return clone(value);
}

export const structuredCloneFacts = {
  keepsCycles: true,
  keepsSharedReferences: true,
  keepsClassPrototype: false,
  copiesFunctions: false,
  keepsDates: true,
  keepsSymbolKeys: false,
};

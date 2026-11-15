const MAX_DEPTH = 2;

function formatKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`;
}

function formatNested(value: unknown, depth: number, seen: Set<object>): string {
  if (typeof value === 'string') return `'${value.replaceAll("'", "\\'")}'`;
  return formatValue(value, depth, seen);
}

function formatValue(value: unknown, depth: number, seen: Set<object>): string {
  if (value === null) return 'null';
  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'string':
      return value;
    case 'number':
      return Object.is(value, -0) ? '-0' : String(value);
    case 'bigint':
      return `${value}n`;
    case 'boolean':
      return String(value);
    case 'symbol':
      return value.toString();
    case 'function': {
      const source = Function.prototype.toString.call(value);
      if (source.startsWith('class')) return `[class ${value.name || '(anonymous)'}]`;
      return value.name ? `[Function: ${value.name}]` : '[Function (anonymous)]';
    }
  }
  const obj = value as object;
  if (seen.has(obj)) return '[Circular *1]';
  if (obj instanceof Error) return `${obj.name}: ${obj.message}`;
  if (obj instanceof Date) return Number.isNaN(obj.getTime()) ? 'Invalid Date' : obj.toISOString();
  if (obj instanceof RegExp) return obj.toString();
  if (depth > MAX_DEPTH) return Array.isArray(obj) ? '[Array]' : '[Object]';
  seen.add(obj);
  try {
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return `[ ${obj.map((v) => formatNested(v, depth + 1, seen)).join(', ')} ]`;
    }
    if (obj instanceof Map) {
      const items = [...obj].map(
        ([k, v]) => `${formatNested(k, depth + 1, seen)} => ${formatNested(v, depth + 1, seen)}`,
      );
      return items.length ? `Map(${obj.size}) { ${items.join(', ')} }` : 'Map(0) {}';
    }
    if (obj instanceof Set) {
      const items = [...obj].map((v) => formatNested(v, depth + 1, seen));
      return items.length ? `Set(${obj.size}) { ${items.join(', ')} }` : 'Set(0) {}';
    }
    const entries = Object.entries(obj).map(
      ([k, v]) => `${formatKey(k)}: ${formatNested(v, depth + 1, seen)}`,
    );
    const ctor = Object.getPrototypeOf(obj)?.constructor?.name;
    const prefix = ctor && ctor !== 'Object' ? `${ctor} ` : '';
    if (Object.getPrototypeOf(obj) === null)
      return `[Object: null prototype] {${entries.length ? ` ${entries.join(', ')} ` : ''}}`;
    return entries.length ? `${prefix}{ ${entries.join(', ')} }` : `${prefix}{}`;
  } finally {
    seen.delete(obj);
  }
}

/** Formats console.log arguments roughly the way Node prints them on one line. */
export function formatArgs(args: readonly unknown[]): string {
  return args.map((a) => formatValue(a, 0, new Set())).join(' ');
}

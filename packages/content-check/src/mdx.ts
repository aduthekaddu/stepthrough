import type { Expression, Program } from 'estree';
import type { Root, RootContent } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx-jsx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { parse as parseYaml } from 'yaml';

export type JsxElement = {
  name: string;
  props: Record<string, unknown>;
  line: number;
  /** Index of the enclosing <Segment>, or -1 outside any segment. */
  segment: number;
  /** Order of appearance in the document. */
  order: number;
};

/** A run of prose with its position, for word counts and term-order checks. */
export type ProseRun = { text: string; line: number; segment: number; order: number };

export type ParsedLesson = {
  frontmatter: unknown;
  elements: JsxElement[];
  prose: ProseRun[];
  segments: { id: string; goal: string; line: number }[];
  /** Name of the first element in the body after frontmatter (component name or mdast type). */
  firstElement: string | null;
};

type JsxNode = MdxJsxFlowElement | MdxJsxTextElement;

/** Evaluates a literal expression (strings, numbers, booleans, null, arrays, objects, plain template literals). */
export function literal(node: Expression): unknown {
  switch (node.type) {
    case 'Literal':
      return node.value;
    case 'TemplateLiteral':
      if (node.expressions.length)
        throw new Error('template literals in props cannot contain placeholders');
      return node.quasis.map((q) => q.value.cooked ?? q.value.raw).join('');
    case 'ArrayExpression':
      return node.elements.map((el) => {
        if (!el || el.type === 'SpreadElement') throw new Error('arrays in props must be plain');
        return literal(el);
      });
    case 'ObjectExpression': {
      const out: Record<string, unknown> = {};
      for (const prop of node.properties) {
        if (prop.type !== 'Property' || prop.computed)
          throw new Error('objects in props must be plain');
        const key =
          prop.key.type === 'Identifier'
            ? prop.key.name
            : String((prop.key as { value: unknown }).value);
        out[key] = literal(prop.value as Expression);
      }
      return out;
    }
    case 'UnaryExpression':
      if (node.operator === '-' && node.argument.type === 'Literal')
        return -(node.argument.value as number);
      throw new Error(`unsupported unary ${node.operator}`);
    default:
      throw new Error(`props must be literals, found ${node.type}`);
  }
}

function propsOf(node: JsxNode): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const attr of node.attributes) {
    if (attr.type !== 'mdxJsxAttribute') throw new Error(`<${node.name}> uses a spread attribute`);
    if (attr.value === null || attr.value === undefined) props[attr.name] = true;
    else if (typeof attr.value === 'string') props[attr.name] = attr.value;
    else {
      const program = attr.value.data?.estree as Program | undefined;
      const statement = program?.body[0];
      if (!statement || statement.type !== 'ExpressionStatement') {
        throw new Error(`<${node.name} ${attr.name}> needs a literal expression`);
      }
      props[attr.name] = literal(statement.expression);
    }
  }
  return props;
}

const processor = unified().use(remarkParse).use(remarkMdx).use(remarkFrontmatter, ['yaml']);

export function parseLesson(source: string): ParsedLesson {
  const tree = processor.parse(source) as Root;
  const elements: JsxElement[] = [];
  const prose: ProseRun[] = [];
  const segments: ParsedLesson['segments'] = [];
  let frontmatter: unknown = null;
  let firstElement: string | null = null;
  let order = 0;

  const walk = (nodes: RootContent[], segment: number) => {
    for (const node of nodes) {
      const line = node.position?.start.line ?? 0;
      if (node.type === 'yaml') {
        frontmatter = parseYaml(node.value);
        continue;
      }
      if (firstElement === null && node.type !== 'mdxjsEsm') {
        firstElement =
          node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement'
            ? (node.name ?? 'fragment')
            : node.type;
        if (firstElement === 'Segment' && 'children' in node) {
          const inner = node.children.find((c) => c.type !== 'text' || c.value.trim());
          firstElement =
            inner && (inner.type === 'mdxJsxFlowElement' || inner.type === 'mdxJsxTextElement')
              ? (inner.name ?? 'fragment')
              : (inner?.type ?? null);
        }
      }
      if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
        const props = propsOf(node);
        const name = node.name ?? 'fragment';
        let childSegment = segment;
        if (name === 'Segment') {
          segments.push({ id: String(props.id ?? ''), goal: String(props.goal ?? ''), line });
          childSegment = segments.length - 1;
        }
        elements.push({ name, props, line, segment: childSegment, order: order++ });
        if (name !== 'Term') walk(node.children as RootContent[], childSegment);
        else
          prose.push({
            text: textOf(node.children as RootContent[]),
            line,
            segment,
            order: order++,
          });
        continue;
      }
      if (node.type === 'text') {
        prose.push({ text: node.value, line, segment, order: order++ });
        continue;
      }
      if (node.type === 'code' || node.type === 'inlineCode' || node.type === 'mdxjsEsm') continue;
      if ('children' in node) walk(node.children as RootContent[], segment);
    }
  };
  walk(tree.children, -1);
  return { frontmatter, elements, prose, segments, firstElement };
}

function textOf(nodes: RootContent[]): string {
  return nodes
    .map((n) =>
      'value' in n ? String(n.value) : 'children' in n ? textOf(n.children as RootContent[]) : '',
    )
    .join('');
}

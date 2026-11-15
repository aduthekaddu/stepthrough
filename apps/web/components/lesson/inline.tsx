/** Renders a prop string, turning `backtick spans` into inline code. */
export function Inline({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/).map((part, i) =>
    part.length > 2 && part.startsWith('`') && part.endsWith('`') ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: the split of a fixed string never reorders
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      part
    ),
  );
}

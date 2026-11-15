import { CodeBlock } from './highlight';
import { RunnableCode } from './runnable-code';

export function Code({ code, runnable = false }: { code: string; runnable?: boolean | undefined }) {
  const block = <CodeBlock code={code} />;
  return runnable ? (
    <RunnableCode code={code} highlighted={block} />
  ) : (
    <figure className="code-figure">{block}</figure>
  );
}

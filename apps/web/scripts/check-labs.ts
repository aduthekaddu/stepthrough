import { globSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createVitest } from 'vitest/node';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');

/** `clean` is false when a test file or a hook failed outside any single test. */
type Run = { passed: number; failed: number; total: number; clean: boolean };

/** Runs one lab's tests, with `./starter.js` resolved to `implementation`. */
async function runLab(labDir: string, implementation: string, quiet: boolean): Promise<Run> {
  const vitest = await createVitest(
    'test',
    { root: labDir, watch: false, reporters: quiet ? [{}] : ['dot'] },
    { resolve: { alias: [{ find: /^\.\/starter\.js$/, replacement: implementation }] } },
  );
  const { testModules, unhandledErrors } = await vitest.start();
  await vitest.close();
  const tests = testModules.flatMap((module) => [...module.children.allTests()]);
  const count = (state: string) => tests.filter((t) => t.result().state === state).length;
  return {
    passed: count('passed'),
    failed: count('failed'),
    total: tests.length,
    clean: unhandledErrors.length === 0 && testModules.every((module) => module.ok()),
  };
}

const labs = globSync('content/**/lab/lab.test.js', { cwd: appDir }).map((file) =>
  join(appDir, dirname(file)),
);
if (labs.length === 0) throw new Error('no labs found under content/');

let ok = true;
for (const lab of labs) {
  const name = relative(appDir, lab);
  const solution = await runLab(lab, join(lab, 'solution.js'), false);
  const starter = await runLab(lab, join(lab, 'starter.js'), true);
  const solutionOk = solution.total > 0 && solution.passed === solution.total && solution.clean;
  const starterOk = starter.failed > 0;
  ok &&= solutionOk && starterOk;
  console.log(
    `${name}: solution passes ${solution.passed}/${solution.total}` +
      `${solution.clean ? '' : ', with a file or hook error'}` +
      `${solutionOk ? '' : ' (FAIL)'}; starter fails ${starter.failed}/${starter.total}` +
      `${starterOk ? '' : ' (FAIL: the tests do not catch an unfinished starter)'}`,
  );
}
process.exitCode = ok ? 0 : 1;

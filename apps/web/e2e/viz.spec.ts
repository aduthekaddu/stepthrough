import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const PATH = 'playground/viz/';

function figure(page: Page, section: string) {
  const root = page.locator(`#${section} figure`);
  return {
    root,
    diagram: root.getByRole('group', { name: /^Diagram, step/ }),
    narration: root.locator('[aria-live="polite"]'),
    records: root.getByRole('list', { name: 'Environment records' }),
    stack: root.getByRole('list', { name: 'Call stack, newest call first' }),
    next: root.getByRole('button', { name: 'Next step' }),
  };
}

async function stepTo(diagram: Locator, step: number) {
  await diagram.focus();
  await diagram.press('r');
  for (let i = 0; i < step; i++) await diagram.press('ArrowRight');
  await expect(diagram).toHaveAccessibleName(`Diagram, step ${step} of 13`);
}

/** The step where make() has returned: the `after-make` mark in closure-counter.js. */
const AFTER_MAKE = 5;

test('the step keys move the narration forward, back and to the start', async ({ page }) => {
  await page.goto(PATH);
  const { diagram, narration } = figure(page, 'closure');
  await expect(narration).toHaveText(/Step 0 of 13\.\s*Nothing has run yet\./);

  await diagram.focus();
  await diagram.press('ArrowRight');
  await expect(narration).toContainText('Step 1 of 13.');
  await expect(narration).toContainText('every declaration already has a binding');
  await diagram.press('l');
  await expect(narration).toContainText('make() is called.');
  await diagram.press('h');
  await expect(narration).toContainText('Step 1 of 13.');
  await diagram.press('r');
  await expect(narration).toContainText('Nothing has run yet.');
});

test('after make() returns, its record stays with count = 0 and no frame on the stack', async ({
  page,
}) => {
  await page.goto(PATH);
  const { diagram, narration, records, stack } = figure(page, 'closure');
  await stepTo(diagram, AFTER_MAKE);

  await expect(narration).toContainText('make() has returned and its call has left the stack');
  await expect(stack.getByRole('listitem')).toHaveText([/^script/]);
  const make = records.getByRole('listitem').filter({ hasText: 'make() call' }).first();
  await expect(make).toContainText('call ended');
  await expect(make.getByRole('list', { name: 'Bindings in make() call' })).toContainText(
    'let count = 0',
  );
  const global = records.getByRole('listitem').filter({ hasText: 'Global' }).first();
  await expect(global).toContainText('const counter = points to #1');
  await expect(global).toContainText('was uninitialized');
});

test('with reduced motion the same steps land and the changed row flashes its outline', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PATH);
  const { diagram, narration, records } = figure(page, 'closure');
  await stepTo(diagram, AFTER_MAKE);
  await expect(narration).toContainText('make() has returned');
  const changed = records.locator('[data-changed]');
  await expect(changed).toHaveCount(1);
  await expect(changed).toContainText('counter');
  const animation = await records
    .locator('[class*="flash"]')
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toMatch(/flash/);
});

test('the gate locks stepping until the prediction is committed, then asks what changes next', async ({
  page,
}) => {
  await page.goto(PATH);
  const { root, diagram, narration, next } = figure(page, 'closure-scope');
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(root).toContainText('Answer the prediction next to this figure to start stepping.');
  await diagram.focus();
  await diagram.press('ArrowRight');
  await expect(narration).toContainText('Step 0 of 13.');

  await page
    .locator('#closure-scope')
    .getByRole('button', { name: 'Commit my prediction' })
    .click();
  await stepTo(diagram, 6);
  const prompt = root.getByRole('group', { name: /What changes next\?/ });
  await expect(prompt).toBeVisible();
  await diagram.press('ArrowRight');
  await expect(narration).toContainText('Step 6 of 13.');

  await prompt.getByRole('button', { name: 'count in make() call' }).click();
  await expect(narration).toContainText('Step 7 of 13.');
  await expect(narration).toContainText('You predicted: count in make() call. Right.');
  await expect(narration).toContainText('count (in make() call) changes from 0 to 1.');
});

test('the playground has no axe violations', async ({ page }) => {
  await page.goto(PATH);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`every figure step has no axe violations in ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('playground/figures/');
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual(
      [],
    );
  });
}

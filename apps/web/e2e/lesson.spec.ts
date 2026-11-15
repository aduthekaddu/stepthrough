import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const LESSON = '/learn/demo/components/';

const predict = (page: Page, id: string) => page.locator(`[data-predict-id="${id}"]`);

async function answerChoice(page: Page, id: string, option: string, confidence: string) {
  const block = predict(page, id);
  await block.getByRole('radio', { name: option, exact: true }).check();
  await block.getByRole('radio', { name: confidence, exact: true }).check();
  await block.getByRole('button', { name: 'Commit answer' }).click();
  await expect(block.locator('.predict-feedback')).toBeVisible();
}

const storedVisits = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve, reject) => {
        const open = indexedDB.open('stepthrough');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains('lessonProgress')) return resolve(0);
          const count = db.transaction('lessonProgress').objectStore('lessonProgress').count();
          count.onsuccess = () => resolve(count.result);
        };
      }),
  );

async function hydrated(page: Page) {
  await expect(page.locator('.editor-host .cm-editor').first()).toBeVisible();
}

test('a commit needs an answer and a confidence', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  const hook = predict(page, 'hook');
  await hook.getByRole('button', { name: 'Commit answer' }).click();
  await expect(hook.getByText('Give your answer and say how sure you are.')).toBeVisible();
  await hook.getByRole('radio', { name: '2', exact: true }).check();
  await hook.getByRole('button', { name: 'Commit answer' }).click();
  await expect(hook.getByText('Say how sure you are first.')).toBeVisible();
  await expect(hook.locator('.predict-feedback')).toHaveCount(0);
});

test('a confident wrong answer names its misconception and survives a reload', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  await answerChoice(page, 'hook', '1', 'Sure');
  const feedback = predict(page, 'hook').locator('.predict-feedback');
  await expect(feedback).toBeFocused();
  await expect(feedback).toContainText(
    'The belief behind this answer Assigning an object to a second name makes a copy of the object.',
  );
  await expect(feedback).toContainText('You were sure');
  await expect(feedback).toContainText('You read const b = a as making a copy');

  await page.reload();
  const hook = predict(page, 'hook');
  await expect(hook.locator('.predict-feedback')).toContainText('makes a copy of the object');
  await expect(hook.locator('[data-chosen]')).toContainText('1');
  await expect(hook.locator('[data-right]')).toContainText('Correct answer');
  await expect(hook.getByRole('button', { name: 'Commit answer' })).toHaveCount(0);
});

test('a typed answer is compared with the real output', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  const block = predict(page, 'typeof-null');
  await block.getByLabel('Your answer').fill('object  \nobject\n');
  await block.getByRole('radio', { name: 'Think so', exact: true }).check();
  await block.getByRole('button', { name: 'Commit answer' }).click();
  const feedback = block.locator('.predict-feedback');
  await expect(feedback).toContainText('Right');
  await expect(feedback).toContainText('To tell an array apart, use Array.isArray');
  await expect(block.locator('.typed-reveal')).toContainText('Real output');
});

test('three sure, right answers offer summaries that collapse the prose', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  await answerChoice(page, 'hook', '2', 'Sure');
  const typed = predict(page, 'typeof-null');
  await typed.getByLabel('Your answer').fill('object\nobject');
  await typed.getByRole('radio', { name: 'Sure', exact: true }).check();
  await typed.getByRole('button', { name: 'Commit answer' }).click();
  await answerChoice(page, 'spread-copy', '2', 'Sure');

  await predict(page, 'spread-copy').getByRole('button', { name: 'Show summaries' }).click();
  const segment = page.locator('#s02-reference');
  await expect(segment.locator('.segment-goal')).toBeVisible();
  await expect(segment.getByText('did not build a second object')).toBeHidden();
  await expect(segment.locator('.runnable')).toBeVisible();

  await page.reload();
  await expect(segment.locator('.segment-goal')).toBeVisible();
  await page.getByRole('button', { name: 'Show the full lesson' }).click();
  await expect(segment.getByText('did not build a second object')).toBeVisible();
});

test('a term opens its definition on keyboard focus and on click', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  const term = page.locator('[data-term="demo-reference"]');
  const hint = page.locator(`#${await term.getAttribute('interestfor')}`);
  await expect(hint).toBeHidden();

  // A click on the sentence sets where Tab starts, so the next Tab lands on the term.
  await page.getByText('It gave the object a second name.', { exact: false }).click();
  await page.keyboard.press('Tab');
  await expect(term).toBeFocused();
  await expect(hint).toBeVisible();
  await expect(hint).toContainText('A value that points at an object');
  await expect(term).toHaveAttribute('aria-expanded', 'true');

  await page.keyboard.press('Escape');
  await expect(hint).toBeHidden();
  await expect(term).toHaveAttribute('aria-expanded', 'false');

  await page.mouse.click(5, 5);
  await term.click();
  await expect(hint).toBeVisible();
});

test('runnable code shows console output', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  const block = page.locator('.runnable').first();
  await block.getByRole('button', { name: 'Run' }).click();
  await expect(block.locator('.console-lines li')).toHaveText(['2', 'true']);
  await expect(block).toContainText('Finished.');
});

test('an endless loop is stopped after 2 seconds', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  const block = page.locator('.runnable').nth(1);
  const started = Date.now();
  await block.getByRole('button', { name: 'Run' }).click();
  await expect(block).toContainText('Stopped after 2 s', { timeout: 6000 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(2000);
  await expect(block.locator('.console-lines li')).toHaveText(['start']);
  await expect(block.getByRole('button', { name: 'Run' })).toBeEnabled();
});

test('cards register and an explanation survives a reload', async ({ page }) => {
  await page.goto(LESSON);
  await hydrated(page);
  await expect(page.locator('.review-card').first()).toContainText('In your review deck');
  await expect(page.locator('.review-card').nth(1)).toContainText('In your review deck');

  const box = page.getByLabel(/Explain to a junior developer/);
  await box.fill('Both names hold a reference to one object.');
  await expect(page.getByText('Saved in this browser.')).toBeVisible();
  await page.reload();
  await expect(box).toHaveValue('Both names hold a reference to one object.');
});

test('the theme choice applies at once and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto(LESSON);
  const html = page.locator('html');
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await background()).toBe('rgb(247, 244, 238)');

  await page.getByRole('radio', { name: 'Dark', exact: true }).check();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  expect(await background()).toBe('rgb(20, 19, 15)');

  await page.reload();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('radio', { name: 'Dark', exact: true })).toBeChecked();
  expect(await background()).toBe('rgb(20, 19, 15)');

  await page.getByRole('radio', { name: /^System/ }).check();
  await expect(html).not.toHaveAttribute('data-theme');
  expect(await background()).toBe('rgb(247, 244, 238)');
});

test('a stored theme is on the page before the first paint', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('stepthrough-theme', 'dark'));
  await page.goto(LESSON, { waitUntil: 'commit' });
  await page.waitForSelector('body');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
});

test('the home page links to the lesson visited last', async ({ page }) => {
  const FIRST = '/learn/foundations/how-programs-run/';
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^Start:/ })).toBeVisible();
  await page.goto(FIRST);
  await expect.poll(() => storedVisits(page)).toBe(1);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /^Continue: How a program runs/ })).toHaveAttribute(
    'href',
    FIRST,
  );
});

test('lesson 0.1 renders and has no axe violations', async ({ page }) => {
  await page.goto('/learn/foundations/how-programs-run/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('How a program runs');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`the demo lesson has no axe violations in ${scheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto(LESSON);
    await hydrated(page);
    await answerChoice(page, 'hook', '1', 'Sure');
    await page.locator('.runnable').first().getByRole('button', { name: 'Run' }).click();
    await expect(page.locator('.console-lines').first()).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual(
      [],
    );
  });
}

test('a figure gated by a prediction unlocks on commit and stays unlocked after a reload', async ({
  page,
}) => {
  await page.goto(LESSON);
  await hydrated(page);
  const fig = page.locator('figure').filter({ hasText: 'Aliasing' });
  const next = fig.getByRole('button', { name: 'Next step' });
  await expect(next).toHaveAttribute('aria-disabled', 'true');

  await answerChoice(page, 'hook', '2', 'Sure');
  await expect(next).not.toHaveAttribute('aria-disabled', 'true');

  await page.reload();
  await hydrated(page);
  await expect(fig.getByRole('button', { name: 'Next step' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
});

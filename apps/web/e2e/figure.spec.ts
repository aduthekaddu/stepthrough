import { expect, type Page, test } from '@playwright/test';

const LESSON = 'learn/foundations/how-programs-run/';

const predict = (page: Page, id: string) => page.locator(`[data-predict-id="${id}"]`);

async function open(page: Page) {
  await page.goto(LESSON);
  await expect(page.locator('.editor-host .cm-editor').first()).toBeVisible();
}

async function commit(page: Page, id: string, answer: { option: string } | { typed: string }) {
  const block = predict(page, id);
  if ('option' in answer)
    await block.getByRole('radio', { name: answer.option, exact: true }).check();
  else await block.getByLabel('Your answer').fill(answer.typed);
  await block.getByRole('radio', { name: 'Sure', exact: true }).check();
  await block.getByRole('button', { name: 'Commit answer' }).click();
  await expect(block.locator('.predict-feedback')).toBeVisible();
}

test('summaries keep every figure with its controls and caption', async ({ page }) => {
  await open(page);
  await commit(page, 'p-hook', {
    option: "SyntaxError: Identifier 'total' has already been declared",
  });
  await commit(page, 'p-byte', { typed: '200 44' });
  await commit(page, 'p-tabs', { option: 'ReferenceError: score is not defined' });
  await predict(page, 'p-tabs').getByRole('button', { name: 'Show summaries' }).click();

  const program = page.locator('#s02-program');
  await expect(program.locator('.segment-goal')).toBeVisible();
  await expect(program.getByText('prints your function back')).toBeHidden();
  const figure = program.locator('figure').first();
  await expect(figure.getByRole('button', { name: 'Next step' })).toBeVisible();
  await expect(figure.getByText('is a list of instructions')).toBeVisible();
  await expect(
    page.locator('#s13-call-stack figure').getByRole('button', { name: 'Next step' }),
  ).toBeVisible();
});

test('a gate note never points away from its prediction', async ({ page }) => {
  await open(page);
  const wrongWay = await page.evaluate(() =>
    [...document.querySelectorAll('figure')].flatMap((figure) => {
      const note = [...figure.querySelectorAll('p')].find((p) =>
        p.textContent?.includes('to start stepping'),
      );
      const prediction = figure.closest('.segment')?.querySelector('[data-predict-id]');
      if (!note || !prediction) return [];
      const below = Boolean(
        figure.compareDocumentPosition(prediction) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      const says = note.textContent ?? '';
      const wrong = (below && says.includes('above')) || (!below && says.includes('below'));
      return wrong ? [`${figure.closest('.segment')?.id}: ${says}`] : [];
    }),
  );
  expect(wrongWay).toEqual([]);
});

test('hovering the ruler of a locked figure previews no later step', async ({ page }) => {
  await open(page);
  const figure = page.locator('#s06-thread figure').last();
  await expect(figure.getByRole('button', { name: 'Next step' })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  const range = figure.getByRole('slider', { name: 'Step' });
  await range.scrollIntoViewIfNeeded();
  const box = await range.boundingBox();
  if (!box) throw new Error('the step ruler has no box');
  const preview = figure.locator('[class*="preview"]');

  await page.mouse.move(box.x + 2, box.y + box.height / 2);
  await expect(preview).toContainText('00');
  await page.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  await expect(preview).toHaveCount(0);
});

test('with reduced motion, play does not step on its own', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page);
  const figure = page.locator('#s02-program figure').first();
  const picture = figure.getByRole('group', { name: /^Picture, step/ });
  const play = figure.getByRole('button', { name: 'Play' });

  await expect(play).toHaveAttribute('aria-disabled', 'true');
  await play.click();
  await picture.focus();
  await picture.press(' ');
  await page.waitForTimeout(3000);
  await expect(picture).toHaveAccessibleName('Picture, step 1 of 3');
  await picture.press('ArrowRight');
  await expect(picture).toHaveAccessibleName('Picture, step 2 of 3');
});

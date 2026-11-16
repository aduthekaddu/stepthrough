import { devices, expect, type Page, test } from '@playwright/test';

const PAGES = [
  './',
  'learn/foundations/how-programs-run/',
  'learn/javascript/values-and-references/',
  'learn/javascript/execution-context/',
  'learn/demo/components/',
  'playground/viz/',
];
const WIDTHS = [320, 360, 390, 430];

const { defaultBrowserType: _, ...pixel } = devices['Pixel 7'];
test.use(pixel);

/**
 * Elements that make the page wider than the screen, and boxes whose content is wider than
 * the box, whether it scrolls or is cut off. Preformatted text diagrams (`.text-pre`) may
 * scroll inside their own box; nothing else may.
 */
function sidewaysOverflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const name = (el: Element) =>
      el.tagName.toLowerCase() + (el.classList[0] ? `.${el.classList[0]}` : '');
    const tooWide = (el: Element) =>
      el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible';
    const outside: string[] = [];
    const tooWideBoxes: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      const box = el.getBoundingClientRect();
      // Visually hidden text (`.sr-only`) is a 1px box by design.
      if (box.width <= 1 || box.height <= 1) continue;
      if (tooWide(el) && !el.closest('.text-pre')) tooWideBoxes.push(name(el));
      let clipped = false;
      for (let a = el.parentElement; a && !clipped; a = a.parentElement) {
        clipped = /auto|scroll|hidden|clip/.test(getComputedStyle(a).overflowX);
      }
      if (!clipped && (box.right > viewport + 1 || box.left < -1)) outside.push(name(el));
    }
    return {
      pageWidth: document.documentElement.scrollWidth,
      viewport,
      outside: [...new Set(outside)],
      tooWideBoxes: [...new Set(tooWideBoxes)],
    };
  });
}

for (const path of PAGES) {
  test(`${path} fits a phone screen without sideways scrolling`, async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path, { waitUntil: 'networkidle' });
      await expect(page.locator('.editor-host[hidden]')).toHaveCount(0);
      const result = await sidewaysOverflow(page);
      expect(result.pageWidth, `page width at ${width}px`).toBeLessThanOrEqual(result.viewport);
      expect(result.outside, `elements past the screen edge at ${width}px`).toEqual([]);
      expect(result.tooWideBoxes, `boxes cut off or scrolling sideways at ${width}px`).toEqual([]);
    }
  });
}

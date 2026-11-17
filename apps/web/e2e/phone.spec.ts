import { devices, expect, type Page, test } from '@playwright/test';

const PAGES = [
  './',
  'learn/foundations/how-programs-run/',
  'learn/javascript/values-and-references/',
  'learn/javascript/execution-context/',
  'learn/demo/components/',
  'playground/viz/',
  'playground/figures/',
];
const WIDTHS = [360, 390, 430];

const { defaultBrowserType: _, ...pixel } = devices['Pixel 7'];
test.use(pixel);

/**
 * Elements that make the page wider than the screen, and boxes that scroll sideways.
 * Preformatted text diagrams (`.text-pre`) may scroll inside their own box; nothing else may.
 */
function sidewaysOverflow(page: Page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const name = (el: Element) =>
      el.tagName.toLowerCase() + (el.classList[0] ? `.${el.classList[0]}` : '');
    const scrollsSideways = (el: Element) =>
      el.scrollWidth > el.clientWidth + 1 && /auto|scroll/.test(getComputedStyle(el).overflowX);
    const outside: string[] = [];
    const scrollers: string[] = [];
    for (const el of document.body.querySelectorAll('*')) {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (scrollsSideways(el) && !el.closest('.text-pre')) scrollers.push(name(el));
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
      scrollers: [...new Set(scrollers)],
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
      expect(result.scrollers, `boxes that scroll sideways at ${width}px`).toEqual([]);
    }
  });
}

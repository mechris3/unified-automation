import { Page } from 'puppeteer';

export async function clickWithAngularSupport(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return el && getComputedStyle(el).pointerEvents !== 'none';
    },
    { timeout: 5000 },
    selector
  );
  await page.click(selector);
}

export async function fillWithAngularEvents(page: Page, selector: string, value: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel) as HTMLInputElement;
    if (el) {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, selector, value);
}

export async function waitForElement(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: 10000 });
}

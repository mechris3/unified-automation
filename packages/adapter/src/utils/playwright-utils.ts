import { Page } from '@playwright/test';

export async function clickWithAngularSupport(page: Page, selector: string): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return el && getComputedStyle(el).pointerEvents !== 'none';
    },
    selector,
    { timeout: 5000 }
  );
  await page.locator(selector).first().click({ timeout: 10000 });
}

export async function fillWithAngularEvents(page: Page, selector: string, value: string): Promise<void> {
  await page.locator(selector).fill(value, { timeout: 10000 });
  await page.locator(selector).dispatchEvent('input');
  await page.locator(selector).dispatchEvent('change');
}

export async function waitForElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 10000 });
}

export async function getText(page: Page, selector: string): Promise<string> {
  return await page.locator(selector).textContent() || '';
}

export async function scrollIntoViewAndClick(page: Page, selector: string): Promise<void> {
  await waitForElement(page, selector);
  await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, selector);
  await new Promise(resolve => setTimeout(resolve, 500));
  await clickWithAngularSupport(page, selector);
}

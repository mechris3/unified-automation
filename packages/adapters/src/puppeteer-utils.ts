import { Page } from 'puppeteer';

/**
 * Standard timeout for element operations (10 seconds)
 * Harmonized across Puppeteer and Playwright for consistent behavior
 */
const ELEMENT_TIMEOUT = 10000;

/**
 * Waits for an element to be visible in the DOM
 * @param page - Puppeteer Page instance
 * @param selector - CSS selector
 */
export async function waitForElement(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: ELEMENT_TIMEOUT });
}

/**
 * Clicks an element with Angular/React framework support
 * Ensures pointer-events are enabled and dispatches MouseEvent for framework compatibility
 * @param page - Puppeteer Page instance
 * @param selector - CSS selector
 */
export async function clickWithAngularSupport(page: Page, selector: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: ELEMENT_TIMEOUT });
  
  // Angular/React safe click: ensure pointer-events are not none
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel as string);
      return el && getComputedStyle(el).pointerEvents !== 'none';
    }, 
    { timeout: ELEMENT_TIMEOUT }, 
    selector
  );
  
  // Perform standard click
  await page.click(selector);
  
  // Dispatch MouseEvent for frameworks that might miss the standard click
  await page.evaluate((sel) => {
    const el = document.querySelector(sel as string) as HTMLElement;
    if (el) {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    }
  }, selector);
}

/**
 * Fills an input field with Angular/React event support
 * Dispatches input and change events for reactive form validation
 * @param page - Puppeteer Page instance
 * @param selector - CSS selector
 * @param value - Value to fill
 */
export async function fillWithAngularEvents(page: Page, selector: string, value: string): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout: ELEMENT_TIMEOUT });
  
  // Trigger input/change events for frameworks like Angular/React
  await page.evaluate((sel, val) => {
    const el = document.querySelector(sel as string) as HTMLInputElement;
    if (el) {
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, selector, value);
}

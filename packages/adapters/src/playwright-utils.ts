import { Page } from '@playwright/test';

/**
 * Standard timeout for element operations (10 seconds)
 * Harmonized across Puppeteer and Playwright for consistent behavior
 */
const ELEMENT_TIMEOUT = 10000;

/**
 * Waits for an element to be visible in the DOM
 * @param page - Playwright Page instance
 * @param selector - CSS selector
 */
export async function waitForElement(page: Page, selector: string): Promise<void> {
  await page.locator(selector).waitFor({ state: 'visible', timeout: ELEMENT_TIMEOUT });
}

/**
 * Clicks an element with Angular/React framework support
 * Dispatches click events for framework compatibility
 * @param page - Playwright Page instance
 * @param selector - CSS selector
 */
export async function clickWithAngularSupport(page: Page, selector: string): Promise<void> {
  await page.locator(selector).click({ timeout: ELEMENT_TIMEOUT });
  
  // Dispatch MouseEvent for frameworks that might need explicit event handling
  await page.locator(selector).dispatchEvent('click');
}

/**
 * Fills an input field with Angular/React event support
 * Dispatches input and change events for reactive form validation
 * @param page - Playwright Page instance
 * @param selector - CSS selector
 * @param value - Value to fill
 */
export async function fillWithAngularEvents(page: Page, selector: string, value: string): Promise<void> {
  await page.locator(selector).fill(value, { timeout: ELEMENT_TIMEOUT });
  
  // Dispatch events for Angular/React reactive forms
  await page.locator(selector).dispatchEvent('input');
  await page.locator(selector).dispatchEvent('change');
}

/**
 * Safely extracts text content from an element
 * Returns empty string if element has no text content
 * @param page - Playwright Page instance
 * @param selector - CSS selector
 */
export async function getTextSafe(page: Page, selector: string): Promise<string> {
  const text = await page.locator(selector).textContent({ timeout: ELEMENT_TIMEOUT });
  return text || '';
}

/**
 * Scrolls an element into view and clicks it
 * Fallback strategy for elements outside the viewport
 * @param page - Playwright Page instance
 * @param selector - CSS selector
 */
export async function scrollIntoViewAndClick(page: Page, selector: string): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded({ timeout: ELEMENT_TIMEOUT });
  await page.locator(selector).click({ timeout: ELEMENT_TIMEOUT });
  
  // Dispatch click event for framework compatibility
  await page.locator(selector).dispatchEvent('click');
}

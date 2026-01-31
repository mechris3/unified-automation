import { UnifiedAdapter } from '@unified-automation/adapters';

/**
 * BasePage provides a foundation for all Page Objects.
 * It encapsulates the BrowserAdapter and common page-level utilities.
 */
export abstract class BasePage {
  /**
   * @param {UnifiedAdapter} adapter - The adapter used to interact with the browser.
   */
  constructor(protected adapter: UnifiedAdapter) {}

  /**
   * Navigates to a specific URL.
   * @param {string} url - The destination URL.
   */
  async navigate(url: string): Promise<void> {
    await this.adapter.navigate(url);
  }

  /**
   * Helper to wait for a selector to be present in the DOM.
   * @param {string} selector - CSS selector.
   */
  async waitForSelector(selector: string): Promise<void> {
    await this.adapter.waitForSelector(selector);
  }

  /**
   * Helper to wait for a selector to be hidden or removed from the DOM.
   * @param {string} selector - CSS selector.
   */
  async waitForHidden(selector: string): Promise<void> {
    await this.adapter.waitForHidden(selector);
  }
}

import { Page } from '@playwright/test';
import { UnifiedAdapter } from './unified-adapter.interface';
import { clickWithAngularSupport, fillWithAngularEvents, waitForElement, getTextSafe, scrollIntoViewAndClick } from './playwright-utils';

export class PlaywrightAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async click(selector: string): Promise<void> {
    try {
      await clickWithAngularSupport(this.page, selector);
    } catch (error: any) {
      // Viewport fallback: scroll element into view if it's outside the viewport
      if (error.message?.includes('outside of the viewport') || error.message?.includes('not visible')) {
        await scrollIntoViewAndClick(this.page, selector);
      } else {
        throw error;
      }
    }
  }

  async fill(selector: string, value: string): Promise<void> {
    await fillWithAngularEvents(this.page, selector, value);
  }

  async waitForSelector(selector: string): Promise<void> {
    await waitForElement(this.page, selector);
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async clickAndWaitForNavigation(selector: string): Promise<void> {
    await this.page.locator(selector).click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimeout(ms: number): Promise<void> {
    // Use JavaScript setTimeout for consistency with Puppeteer
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async isDisabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isDisabled();
  }

  async getText(selector: string): Promise<string> {
    return await getTextSafe(this.page, selector);
  }

  async getInputValue(selector: string): Promise<string> {
    return await this.page.locator(selector).inputValue();
  }

  async countElements(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  async readClipboard(): Promise<string> {
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForHidden(selector: string): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'hidden' });
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  async evaluate<T>(script: () => T, ...args: any[]): Promise<T> {
    // Playwright evaluate passes logic slightly differently but for 0-arg functions usually fine
    // For args we might need to handle serializability
    return await this.page.evaluate(script as any, ...args);
  }
}

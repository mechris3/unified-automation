import { Page } from '@playwright/test';
import { UnifiedAdapter } from './unified-adapter.interface';

export class PlaywrightAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async click(selector: string): Promise<void> {
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.locator(selector).fill(value);
  }

  async waitForSelector(selector: string): Promise<void> {
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isVisible();
  }

  async clickAndWaitForNavigation(selector: string): Promise<void> {
    await this.page.locator(selector).click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  async isDisabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isDisabled();
  }

  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
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

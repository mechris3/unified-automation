import { Page } from 'puppeteer';
import { UnifiedAdapter } from './unified-adapter.interface';
import { clickWithAngularSupport, fillWithAngularEvents, waitForElement } from './puppeteer-utils';

export class PuppeteerAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  }

  async click(selector: string): Promise<void> {
    await clickWithAngularSupport(this.page, selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await fillWithAngularEvents(this.page, selector, value);
  }

  async waitForSelector(selector: string): Promise<void> {
    await waitForElement(this.page, selector);
  }

  async isVisible(selector: string): Promise<boolean> {
    const element = await this.page.$(selector);
    return element !== null;
  }

  async clickAndWaitForNavigation(selector: string): Promise<void> {
    await Promise.all([
      this.page.click(selector),
      this.page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
  }

  async waitForTimeout(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  async isDisabled(selector: string): Promise<boolean> {
    return await this.page.$eval(selector, (el) => (el as HTMLButtonElement).disabled);
  }

  async getText(selector: string): Promise<string> {
    return await this.page.$eval(selector, (el) => el.textContent || '');
  }

  async getInputValue(selector: string): Promise<string> {
    return await this.page.$eval(selector, (el) => (el as HTMLInputElement).value);
  }

  async countElements(selector: string): Promise<number> {
    const elements = await this.page.$$(selector);
    return elements.length;
  }

  async readClipboard(): Promise<string> {
    return await this.page.evaluate(() => navigator.clipboard.readText());
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForHidden(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { hidden: true });
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr as string), attribute);
  }

  async evaluate<T>(script: () => T, ...args: any[]): Promise<T> {
    // Puppeteer evaluate takes the function and then args
    // We need to cast script to any because puppeteer types are complex around EvaluateFn
    return await this.page.evaluate(script as any, ...args);
  }
}

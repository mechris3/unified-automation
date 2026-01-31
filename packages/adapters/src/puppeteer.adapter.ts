import { Page } from 'puppeteer';
import { UnifiedAdapter } from './unified-adapter.interface';

export class PuppeteerAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  }

  async click(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true });
    // Angular/React safe click: ensure pointer-events are not none
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel as string);
        return el && getComputedStyle(el).pointerEvents !== 'none';
      }, { timeout: 5000 }, selector
    );
    
    // Perform standard click
    await this.page.click(selector);
    
    // Dispatch MouseEvent for frameworks that might miss the standard click
    await this.page.evaluate((sel) => {
      const el = document.querySelector(sel as string) as HTMLElement;
      if (el) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      }
    }, selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true });
    // Trigger input/change events for frameworks like Angular/React
    await this.page.evaluate((sel, val) => {
      const el = document.querySelector(sel as string) as HTMLInputElement;
      if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, selector, value);
  }

  async waitForSelector(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true });
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

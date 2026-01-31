import { UnifiedAdapter } from '../unified-adapter.interface';

/**
 * Specialized Adapter Example
 * 
 * This example demonstrates how to extend the framework for complex custom controls
 * (like a 3D Canvas, a specialized Chart, or a complex Data Grid).
 * 
 * STEPS TO IMPLEMENT:
 * 1. Add the method signature to UnifiedAdapter interface.
 * 2. Implement the logic in PuppeteerAdapter and PlaywrightAdapter.
 * 3. Use it in your Page Objects via this.adapter.mySpecialMethod().
 */

/*
// 1. In packages/adapters/src/unified-adapter.interface.ts:
export interface UnifiedAdapter {
    // ... items ...
    selectMuiSlider(selector: string, value: number): Promise<void>;
}

// 2a. In packages/adapter/src/puppeteer-adapter.ts:
async selectMuiSlider(selector: string, value: number): Promise<void> {
    const slider = await this.page.waitForSelector(selector);
    // Puppeteer specialized implementation (e.g. mouse drag)
}

// 2b. In packages/adapter/src/playwright-adapter.ts:
async selectMuiSlider(selector: string, value: number): Promise<void> {
    // Playwright specialized implementation (e.g. locator.dragTo)
    await this.page.locator(selector).nth(0).dragTo(...);
}

// 3. In your Page Object:
async setTemperature(value: number) {
    await this.adapter.selectMuiSlider('[data-testid="temp-slider"]', value);
}
*/

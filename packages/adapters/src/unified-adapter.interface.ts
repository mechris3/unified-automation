export interface UnifiedAdapter {
  click(selector: string): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  waitForSelector(selector: string): Promise<void>;
  isVisible(selector: string): Promise<boolean>;
  clickAndWaitForNavigation(selector: string): Promise<void>;
  waitForTimeout(ms: number): Promise<void>;
  isDisabled(selector: string): Promise<boolean>;
  getText(selector: string): Promise<string>;
  getInputValue(selector: string): Promise<string>;
  countElements(selector: string): Promise<number>;
  readClipboard(): Promise<string>;
  getCurrentUrl(): Promise<string>;
  waitForHidden(selector: string): Promise<void>;
  getAttribute(selector: string, attribute: string): Promise<string | null>;
  evaluate<T>(script: () => T, ...args: any[]): Promise<T>;
  navigate(url: string): Promise<void>;
}

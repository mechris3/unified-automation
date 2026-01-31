# Unified Automation Framework Specification

This document serves as a complete blueprint for generating the `unified-automation` repository. It contains the architecture, directory structure, and source code for the core components.

**Goal:** Create a portable, drop-in testing framework that executes the SAME test logic using either Puppeteer (for fast development/debugging) or Playwright (for robust CI/CD).

## 1. Directory Structure

The generated repository should look like this:

```
unified-automation/
├── package.json                 # Root workspace config
├── tsconfig.json                # Base typescript config
├── .gitignore
├── packages/
│   ├── adapters/                # The core Adapter Interfaces & Implementation
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── unified-adapter.interface.ts  # Standard Interface
│   │       ├── puppeteer.adapter.ts          # Puppeteer Implementation
│   │       └── playwright.adapter.ts         # Playwright Implementation
│   │
│   ├── test-infrastructure/     # Shared test code (Page Objects, Journeys)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── page-objects/    # Reusable Page Objects
│   │   │   │   ├── BasePage.ts
│   │   │   │   └── test-app.page.ts
│   │   │   ├── journeys/        # The actual tests (Journey pattern)
│   │   │   │   └── sample.journey.ts
│   │   │   ├── config/          # Centralized configuration
│   │   │   │   └── config.ts
│   │   │   └── BaseJourney.ts   # Abstract lifecycle base class
│   │
│   ├── puppeteer-runner/        # Puppeteer-based runner for local dev
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │       ├── run-journey.ts
│   │       ├── run-all.ts
│   │       └── utils/
│   │           └── browser.ts
│   │
│   ├── test-runner-ui/          # Web dashboard to control tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   └── app.js
│   │   └── server/
│   │       ├── index.ts
│   │       ├── test-executor.ts
│   │       └── journey-discovery.ts
│   │
│   └── playwright-runner/       # Playwright runner configuration
│       ├── package.json
│       ├── playwright.config.ts
│       └── tests/               # Wrapper specs
│
└── README.md
```

---

## 2. Shared Packages Code

### `packages/adapters/src/unified-adapter.interface.ts`
This is the contract that both tools must satisfy.

```typescript
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
```

### `packages/adapters/src/puppeteer.adapter.ts`

```typescript
import { Page } from 'puppeteer';
import { UnifiedAdapter } from './unified-adapter.interface';

export class PuppeteerAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

  async click(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true });
    // Angular/React safe click: ensure pointer-events are not none
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        return el && getComputedStyle(el).pointerEvents !== 'none';
      }, { timeout: 5000 }, selector
    );
    await this.page.click(selector);
  }

  async fill(selector: string, value: string): Promise<void> {
    await this.page.waitForSelector(selector, { visible: true });
    // Trigger input/change events for frameworks like Angular/React
    await this.page.evaluate((sel, val) => {
      const el = document.querySelector(sel) as HTMLInputElement;
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
    return await this.page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
  }

  async evaluate<T>(script: () => T): Promise<T> {
    return await this.page.evaluate(script);
  }
}
```

### `packages/adapters/src/playwright.adapter.ts`

```typescript
import { Page } from '@playwright/test';
import { UnifiedAdapter } from './unified-adapter.interface';

export class PlaywrightAdapter implements UnifiedAdapter {
  constructor(private page: Page) {}

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

  async evaluate<T>(script: () => T): Promise<T> {
    return await this.page.evaluate(script);
  }
}
```

---

## 3. Test Runner UI Code

### `packages/test-runner-ui/server/index.ts`
The Express server that powers the Dashboard.

```typescript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { discoverJourneys } from './journey-discovery';
import { TestExecutor } from './test-executor';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let currentExecutor: TestExecutor | null = null;

app.use(express.json());
// Serve the frontend
app.use(express.static(path.join(__dirname, '../public')));

// Serve Playwright report if it exists
const playwrightReportPath = path.join(__dirname, '../../../packages/playwright-runner/playwright-report');
app.use('/playwright-report', express.static(playwrightReportPath));

app.get('/api/journeys', async (req, res) => {
  try {
    const journeys = await discoverJourneys();
    res.json(journeys);
  } catch (error) {
    res.status(500).json({ error: 'Failed to discover journeys' });
  }
});

app.post('/api/tests/run', (req, res) => {
  const { journeys, tool, mode } = req.body;
  
  if (currentExecutor) {
    return res.status(400).json({ error: 'Tests already running' });
  }
  
  currentExecutor = new TestExecutor(tool, mode, wss);
  
  // Note: We don't await run() here so the request returns immediately
  currentExecutor.run(journeys).finally(() => {
    currentExecutor = null;
  });
  
  res.json({ status: 'started' });
});

app.post('/api/tests/stop', (req, res) => {
  if (currentExecutor) {
    currentExecutor.stop();
    currentExecutor = null;
    res.json({ status: 'stopped' });
  } else {
    res.json({ status: 'no tests running' });
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 Test Runner UI: http://localhost:${PORT}`);
});
```

### `packages/test-runner-ui/server/journey-discovery.ts`
Scans for journey files.

```typescript
import * as fs from 'fs';
import * as path from 'path';

export interface Journey {
  id: string;
  name: string;
  path: string;
}

export async function discoverJourneys(): Promise<Journey[]> {
  const journeysDir = path.join(__dirname, '../../../packages/test-infrastructure/src/journeys');
  
  if (!fs.existsSync(journeysDir)) return [];
  
  const files = fs.readdirSync(journeysDir)
    .filter(f => f.endsWith('.ts'))
    .sort();
  
  return files.map(file => {
    const id = file.replace(/\.journey\.ts$/, '').replace(/\.ts$/, '');
    return {
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      path: path.join(journeysDir, file)
    };
  });
}
```

### `packages/test-runner-ui/server/test-executor.ts`
Executes the tests as child processes.

```typescript
import { spawn, ChildProcess } from 'child_process';
import { WebSocketServer } from 'ws';
import * as path from 'path';

export class TestExecutor {
  private currentProcess: ChildProcess | null = null;
  private startTime: number = 0;

  constructor(
    private tool: 'puppeteer' | 'playwright',
    private mode: 'headed' | 'headless',
    private wss: WebSocketServer
  ) {}

  async run(journeys: string[]): Promise<void> {
    for (const journey of journeys) {
      try {
        await this.runSingleJourney(journey, journeys.length);
      } catch (error) {
        // Continue to next journey
      }
    }
  }

  private async runSingleJourney(journey: string, totalJourneys: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.startTime = Date.now();
      
      const isPuppeteer = this.tool === 'puppeteer';
      // Adjust CWD to where the runners are
      const cwd = isPuppeteer 
        ? path.join(__dirname, '../../../packages/puppeteer-runner')
        : path.join(__dirname, '../../../packages/playwright-runner');
      
      const command = isPuppeteer ? 'npx' : 'npx';
      
      const args = [];
      if (isPuppeteer) {
        args.push('ts-node', 'src/run-journey.ts', journey);
      } else {
        // Playwright args
        args.push('playwright', 'test');
        if (this.mode === 'headed') args.push('--headed');
        args.push('--grep', journey);
      }

      const env = {
        ...process.env,
        HEADLESS: this.mode === 'headless' ? 'true' : 'false',
        CLOSE_BROWSER: totalJourneys > 1 ? 'true' : 'false'
      };

      this.broadcast({ type: 'test-start', journey, tool: this.tool });

      this.currentProcess = spawn(command, args, { env, cwd, shell: true });

      this.currentProcess.stdout?.on('data', (d) => this.broadcast({ type: 'log', message: d.toString() }));
      this.currentProcess.stderr?.on('data', (d) => this.broadcast({ type: 'error', message: d.toString() }));

      this.currentProcess.on('close', (code) => {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        this.broadcast({ 
          type: 'test-end', 
          journey, 
          status: code === 0 ? 'passed' : 'failed', 
          duration 
        });
        
        this.currentProcess = null;
        code === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
      });
    });
  }

  stop() {
    this.currentProcess?.kill();
    this.currentProcess = null;
  }

  private broadcast(msg: any) {
    this.wss.clients.forEach(c => {
      if (c.readyState === 1) c.send(JSON.stringify(msg));
    });
  }
}
```

---

## 4. Dev Runner (Puppeteer) Code

### `packages/dev-runner/src/utils/browser.ts`

This utility handles reliable browser launching, specifically addressing common issues with persistent profiles (like Brave/Chrome crash bubbles and session restoration).

```typescript
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

// CONFIGURATION: Set these via env vars or config file in real app
const USER_DATA_DIR = process.env.CHROME_USER_DATA_DIR || path.join(os.homedir(), '.unified-automation-profile');
const EXECUTABLE_PATH = process.env.CHROME_EXECUTABLE_PATH || undefined;
const PROFILE_DIR = 'Default';

/**
 * Clears the crash state from Preferences file to prevent "Restore pages?" bubble.
 */
function clearCrashState(): void {
  const prefsPath = path.join(USER_DATA_DIR, PROFILE_DIR, 'Preferences');
  
  try {
    if (fs.existsSync(prefsPath)) {
      const prefs = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));
      if (prefs.profile) {
        prefs.profile.exit_type = 'Normal';
        prefs.profile.exited_cleanly = true;
      }
      fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2));
    }
  } catch (error) {
    // Silent fail
  }
}

/**
 * Clears previous session tabs to prevent "open previous tabs" behavior.
 * Keeps extensions and cookies intact.
 */
function clearSessionTabs(): void {
  const sessionsPath = path.join(USER_DATA_DIR, PROFILE_DIR, 'Sessions');
  try {
    if (fs.existsSync(sessionsPath)) {
      fs.rmSync(sessionsPath, { recursive: true, force: true });
    }
  } catch (error) {
    // Silent fail
  }
}

export const browser = (async () => {
  const isHeadless = process.env.HEADLESS === 'true';

  // Only run cleanup if using a persistent profile
  if (process.env.CHROME_USER_DATA_DIR) {
    clearCrashState();
    clearSessionTabs();
    // Small delay to ensure file system writes complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return puppeteer.launch({
    headless: isHeadless,
    defaultViewport: null,
    executablePath: fs.existsSync(EXECUTABLE_PATH) ? EXECUTABLE_PATH : undefined,
    userDataDir: fs.existsSync(USER_DATA_DIR) ? USER_DATA_DIR : undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--disable-session-crashed-bubble',
      '--hide-crash-restore-bubble',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      // Add extension loading args here if needed
    ],
  });
})();
```

### `packages/dev-runner/src/run-journey.ts`

```typescript
import { PuppeteerAdapter } from '@unified-automation/adapters';
// Note: Imports would need to change based on actual package structure or relative paths
// Assuming we can import the journey file dynamically

const journeyName = process.argv[2];

if (!journeyName) {
  console.error('Usage: ts-node run-journey.ts <journey-name>');
  process.exit(1);
}

// Logic to dynamically import the journey from test-infrastructure
// and execute it with PuppeteerAdapter.
// See existing implementation for DynamicJourneyAutomation class.
```

---

### `e2e/playwright.config.ts`

Optimized for high-performance hardware.

```typescript
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  // Optimized for high-performance hardware
  fullyParallel: true,      // execute all tests in parallel
  workers: '100%',          // utilize all available CPU cores
  retries: 0,               // fail fast locally
  reporter: [['html'], ['list']],
  
  webServer: {
    command: 'npm run start:app', 
    port: 4200,
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'pipe',
  },
  
  use: {
    // Rich artifacts for high-end dev machines
    trace: 'retain-on-failure',
    video: 'retain-on-failure', 
    screenshot: 'only-on-failure',
    viewport: { width: 1920, height: 1080 },
    actionTimeout: 15000,
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Modern hardware handles multiple browsers easily
    // {
    //   name: 'webkit', // Safari
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
};
export default config;
```

## 5. Test Infrastructure Code

### `packages/test-infrastructure/src/BaseJourney.ts`
Manages the journey lifecycle (setup -> execute -> finish).

```typescript
import { UnifiedAdapter } from '@unified-automation/adapters';
import { config } from './config/config';

export abstract class BaseJourney {
  protected startTime!: number;

  constructor(protected adapter: UnifiedAdapter) {}

  async setup(): Promise<void> {
    this.startTime = Date.now();
    await this.adapter.navigate(config.appUrl);
  }

  async finish(): Promise<void> {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.info(`⏱️ Journey execution time: ${duration} seconds`);
  }

  abstract execute(): Promise<void>;

  async run(): Promise<void> {
    try {
      await this.setup();
      await this.execute();
      await this.finish();
    } catch (error) {
      throw error;
    }
  }
}
```

### `packages/test-infrastructure/src/page-objects/BasePage.ts`
Foundation for all Page Objects.

```typescript
import { UnifiedAdapter } from '@unified-automation/adapters';

export abstract class BasePage {
  constructor(protected adapter: UnifiedAdapter) {}

  async navigate(url: string): Promise<void> {
    await this.adapter.navigate(url);
  }

  async waitForSelector(selector: string): Promise<void> {
    await this.adapter.waitForSelector(selector);
  }

  async waitForHidden(selector: string): Promise<void> {
    await this.adapter.waitForHidden(selector);
  }
}
```

### `packages/test-infrastructure/src/config/config.ts`
Centralized environment configuration.

```typescript
export const config = {
  appUrl: process.env.APP_URL || 'http://localhost:3002',
  defaultTimeout: 5000,
  shouldCloseBrowser: process.env.CLOSE_BROWSER === 'true',
  loadExtensions: process.env.LOAD_EXTENSIONS === 'true' || true,
};
```

## 6. Sample Journey Implementation

### `packages/test-infrastructure/src/journeys/sample.journey.ts`
Demonstrates orchestration using the Page Object Model.

```typescript
import { BaseJourney } from '../BaseJourney';
import { TestAppPage } from '../page-objects/test-app.page';

export class SampleJourney extends BaseJourney {
  async execute() {
    const testPage = new TestAppPage(this.adapter);
    
    // Perform steps using descriptive POM methods
    await testPage.login('automation-user', 'password123');
    await testPage.verifyLoginSuccess('automation-user');
    
    await testPage.openConfirmationModal();
    await testPage.verifyModalTitle('Confirmation');
    await testPage.confirmModal();
  }
}
```

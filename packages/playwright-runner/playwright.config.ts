import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  // Increased timeout for complex multi-step journeys
  timeout: 60000,
  
  // Parallel execution for performance on modern hardware
  // NOTE: Disable (fullyParallel: false, workers: 1) if tests share database state
  fullyParallel: true,
  workers: process.env.CI ? 1 : '100%',
  retries: 0,
  reporter: [['html'], ['list']],
  
  use: {
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
    }
  ],
};
export default config;

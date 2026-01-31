import { PlaywrightTestConfig, devices } from '@playwright/test';
import * as path from 'path';

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
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

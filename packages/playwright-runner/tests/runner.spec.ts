import { test } from '@playwright/test';
import { PlaywrightAdapter } from '@unified-automation/adapters';
import * as fs from 'fs';
import * as path from 'path';

// Path to journeys - relative to this file (e2e/tests/runner.spec.ts)
const JOURNEYS_DIR = path.resolve(__dirname, '../../test-infrastructure/src/journeys');

// Discover Test Files
const journeyFiles = fs.readdirSync(JOURNEYS_DIR).filter(f => f.endsWith('.journey.ts'));

for (const file of journeyFiles) {
  const journeyId = file.replace('.journey.ts', '');
  const journeyName = journeyId; // Simple name for grep

  test(journeyName, async ({ page }) => {
    // Dynamic import the journey class
    // We import relative to the package structure or this file
    // Note: In TS execution, this path needs to handle TS files or compiled JS.
    // Since we are running with playwright (which supports TS), we can import source.
    
    const journeyPath = path.join(JOURNEYS_DIR, file);
    // Use require instead of dynamic import to ensure Playwright's transform handles it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require(journeyPath);
    
    // Assume first exported class is the Journey
    const ExportedClass = Object.values(mod)[0] as any;
    
    if (!ExportedClass) {
      throw new Error(`No class exported in ${file}`);
    }

    const adapter = new PlaywrightAdapter(page);
    const journey = new ExportedClass(adapter);
    
    await journey.run();
  });
}

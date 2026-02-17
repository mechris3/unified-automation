import { test } from '@playwright/test';
import { PlaywrightAdapter } from '@unified-automation/adapter';
import * as fs from 'fs';
import * as path from 'path';

const journeysDir = path.join(__dirname, '../../test-infrastructure/journeys');
const journeyFiles = fs.readdirSync(journeysDir)
  .filter(f => f.endsWith('.journey.ts') && !f.includes('README'));

const journeys = journeyFiles.map(file => {
  const name = file.replace('.journey.ts', '');
  const module = require(path.join(journeysDir, file));
  const className = Object.keys(module).find(k => k.endsWith('Journey'));
  return { name, class: module[className!] };
});

for (const journey of journeys) {
  test.describe(journey.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '), () => {
    test(`should execute ${journey.name} journey`, async ({ page }) => {
      const adapter = new PlaywrightAdapter(page);
      const instance = new journey.class(adapter);

      await page.goto('/');
      await instance.execute();
    });
  });
}

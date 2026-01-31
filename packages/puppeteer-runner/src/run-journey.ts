import { PuppeteerAdapter } from '@unified-automation/adapters';
import { puppeteerLauncher } from './utils/puppeteer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Dynamically loads a journey class from the filesystem.
 * Searches for files in packages/test-infrastructure/src/journeys/
 * 
 * @param {string} name - The base name of the journey file (e.g., 'sample').
 * @returns {Promise<any>} The first exported class found in the module.
 * @throws {Error} If no file is found or no class is exported.
 */
async function loadJourney(name: string) {
  const journeysDir = path.resolve(__dirname, '../../test-infrastructure/src/journeys');
  
  // Try .journey.ts first, then .ts
  const possiblePaths = [
    path.join(journeysDir, `${name}.journey.ts`),
    path.join(journeysDir, `${name}.ts`)
  ];

  let journeyModule;
  let foundPath = '';

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      // Use dynamic import. Note: ts-node handles the .ts extension resolution.
      journeyModule = await import(p);
      break;
    }
  }

  if (!journeyModule) {
    throw new Error(`Journey file not found for "${name}". Searched: ${possiblePaths.join(', ')}`);
  }
  
  // Get first exported class (don't rely on naming convention)
  const exportedClasses = Object.values(journeyModule).filter(exp => typeof exp === 'function');
  
  if (exportedClasses.length === 0) {
    throw new Error(`No class found exported in journey file "${name}".`);
  }
  
  return exportedClasses[0];
}

async function run() {
  const journeyName = process.argv[2];

  if (!journeyName) {
    console.error('Usage: npm run execute -- <journey-name>');
    process.exit(1);
  }

  const browser = await puppeteerLauncher;
  const pages = await browser.pages();
  const page = pages.length > 0 ? pages[0] : await browser.newPage();

  const adapter = new PuppeteerAdapter(page);

  try {
    const JourneyClass = await loadJourney(journeyName) as any;
    const journey = new JourneyClass(adapter);
    
    // BaseJourney handles setup/execute/finish lifecycle
    await journey.run();
  } catch (error) {
    console.error('❌ Journey failed:', error);
    process.exit(1);
  } finally {
    if (process.env.CLOSE_BROWSER === 'true') {
      await browser.close();
    } else {
      // Keep alive for dev inspection as per standard development practices
      // await new Promise(() => {}); // Optional: keep process alive if needed
    }
  }
}

run();

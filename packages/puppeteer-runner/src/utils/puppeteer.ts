import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

/**
 * Attempts to find a suitable browser executable in common system locations.
 * This ensures the framework works 'out of the box' on major platforms.
 */
function findBestBrowserExecutable(): string | undefined {
  if (process.env.CHROME_EXECUTABLE_PATH) return process.env.CHROME_EXECUTABLE_PATH;

  const macPaths = [
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];

  if (process.platform === 'darwin') {
    for (const path of macPaths) {
      if (fs.existsSync(path)) return path;
    }
  }

  // Fallback to Puppeteer's default discovery (bundled browser)
  return undefined;
}

const EXECUTABLE_PATH = findBestBrowserExecutable();
const USER_DATA_DIR = process.env.CHROME_USER_DATA_DIR || path.join(os.tmpdir(), 'unified-automation-profile');
const PROFILE_DIR = 'Default';



/**
 * Clears the crash state from Preferences file to prevent "Restore pages?" bubble.
 * This searches for the Preferences file in the user data directory and updates the exit_type.
 * 
 * @returns {void}
 */
function clearCrashState(): void {
  if (!USER_DATA_DIR) return;
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
 * Keeps extensions and cookies intact, but removes the Sessions directory.
 * 
 * @returns {void}
 */
function clearSingletonLock(): void {
  if (!USER_DATA_DIR) return;
  const lockPath = path.join(USER_DATA_DIR, 'SingletonLock');
  try {
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }
  } catch (error) {
    console.error(`[BrowserUtils] Failed to remove lock file: ${error}`);
  }
}

/**
 * Clears session data to ensure a fresh start.
 * 
 * @returns {void}
 */
function clearSessionTabs(): void {
  if (!USER_DATA_DIR) return;
  const sessionsPath = path.join(USER_DATA_DIR, PROFILE_DIR, 'Sessions');
  try {
    if (fs.existsSync(sessionsPath)) {
      fs.rmSync(sessionsPath, { recursive: true, force: true });
    }
  } catch (error) {
    // Silent fail
  }
}


// Extension Configuration
// Set EXTENSION_PATH to the absolute path of the unpacked extension directory
const EXTENSION_PATH = process.env.EXTENSION_PATH || '';
const LOAD_EXTENSIONS = process.env.LOAD_EXTENSIONS === 'true' || true; // Default to true for now as requested

/**
 * Launches a Puppeteer browser instance with the configured settings.
 * 
 * This function handles:
 * 1. Profile cleanup (crash state, session tabs, singleton locks).
 * 2. Extension loading (if configured).
 * 3. Browser argument configuration (disabling sandboxes, infobars, etc.).
 * 
 * @returns {Promise<puppeteer.Browser>} The launched browser instance.
 */
export const puppeteerLauncher = (async () => {
  const isHeadless = process.env.HEADLESS === 'true';

  // Only run cleanup if using a persistent profile
  if (USER_DATA_DIR) {
    // If using our temp profile, just wipe it clean to avoid lock issues
    if (USER_DATA_DIR.includes('unified-automation-profile') && fs.existsSync(USER_DATA_DIR)) {
        try {
            fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
        } catch (e) {
            console.warn(`[BrowserUtils] Failed to clean temp profile: ${e}`);
        }
    } else if (fs.existsSync(USER_DATA_DIR)) {
        // For persistent profiles, try to be surgical
        const lockPath = path.join(USER_DATA_DIR, 'SingletonLock');
        if (fs.existsSync(lockPath)) {
            try {
                fs.unlinkSync(lockPath);
            } catch (e) {}
        }
    }
    
    // Small delay to ensure file system writes complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--disable-session-crashed-bubble',
      '--hide-crash-restore-bubble',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
  ];

  if (LOAD_EXTENSIONS && fs.existsSync(EXTENSION_PATH)) {
      args.push(
          `--disable-extensions-except=${EXTENSION_PATH}`,
          `--load-extension=${EXTENSION_PATH}`
      );
  }

  return puppeteer.launch({
    headless: isHeadless,
    defaultViewport: null,
    executablePath: EXECUTABLE_PATH,
    userDataDir: USER_DATA_DIR,
    args,
  });
})();

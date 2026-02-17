export const config = {
  appUrl: process.env.APP_URL || 'http://localhost:8080',
  headless: process.env.HEADLESS === 'true',
  closeBrowser: process.env.CLOSE_BROWSER === 'true',
  defaultTimeout: 5000,
};

/**
 * Centralized configuration for the Unified Automation Framework.
 * 
 * Provides environment-specific settings for the test infrastructure.
 */
export const config = {
  /**
   * Base URL for the application under test (test-app).
   */
  appUrl: process.env.APP_URL || 'http://localhost:3002',
  
  /**
   * Default timeout for browser operations in milliseconds.
   */
  defaultTimeout: 5000,
  
  /**
   * Whether to close the browser after test execution.
   * Controlled by CLOSE_BROWSER environment variable.
   */
  shouldCloseBrowser: process.env.CLOSE_BROWSER === 'true',
  
  /**
   * Whether to load browser extensions.
   */
  loadExtensions: process.env.LOAD_EXTENSIONS === 'true' || true,
};

import { BasePage } from './BasePage';
import { config } from '../config/config';

/**
 * TestAppPage encapsulates all selectors and interactions for the Test Application.
 */
export class TestAppPage extends BasePage {
  /**
   * Selective definitions for the Test App UI.
   * Using 'private readonly' ensures encapsulation.
   */
  private readonly selectors = {
    usernameInput: '[data-testid="input-username"]',
    passwordInput: '[data-testid="input-password"]',
    roleSelect: '[data-testid="select-role"]',
    submitButton: '[data-testid="btn-submit"]',
    resetButton: '[data-testid="btn-reset"]',
    formResult: '[data-testid="form-result"]',
    
    openModalButton: '[data-testid="btn-open-modal"]',
    modalOverlay: '[data-testid="modal-overlay"]',
    modalTitle: '.modal h3',
    modalConfirmButton: '[data-testid="modal-confirm"]',
    modalCloseButton: '[data-testid="modal-close"]',
    
    delayedButton: '[data-testid="btn-delayed"]',
    delayedResult: '#delayed-result',
    
    tableRows: 'tbody tr',
    dropZone: '#drop-zone',
    fileInput: '#file-input',
    uploadStatus: '#upload-status'
  };

  /**
   * Navigates to the Test App home page.
   */
  async navigateTo() {
    await this.navigate(config.appUrl);
  }

  /**
   * Fills the login form and submits.
   * @param {string} username 
   * @param {string} password 
   * @param {string} role 
   */
  async login(username: string, password: string, role: string = 'user') {
    await this.adapter.fill(this.selectors.usernameInput, username);
    await this.adapter.fill(this.selectors.passwordInput, password);
    await this.adapter.click(this.selectors.submitButton);
  }

  /**
   * Verifies that the login form was submitted successfully with the expected username.
   * @param {string} expectedUsername 
   */
  async verifyLoginSuccess(expectedUsername: string) {
    await this.waitForSelector(`${this.selectors.formResult}:not(.hidden)`);
    const resultText = await this.adapter.getText(this.selectors.formResult);
    if (!resultText.includes(expectedUsername)) {
      throw new Error(`Login verification failed. Expected '${expectedUsername}' in result but got: ${resultText}`);
    }
  }

  /**
   * Opens the confirmation modal.
   */
  async openConfirmationModal() {
    await this.adapter.click(this.selectors.openModalButton);
    await this.waitForSelector(`${this.selectors.modalOverlay}:not(.hidden)`);
  }

  /**
   * Verifies the title of the currently open modal.
   * @param {string} expectedTitle 
   */
  async verifyModalTitle(expectedTitle: string) {
    const actualTitle = await this.adapter.getText(this.selectors.modalTitle);
    if (actualTitle !== expectedTitle) {
      throw new Error(`Modal title verification failed. Expected '${expectedTitle}' but got '${actualTitle}'`);
    }
  }

  /**
   * Confirms the modal and waits for it to close.
   */
  async confirmModal() {
    await this.adapter.click(this.selectors.modalConfirmButton);
    await this.waitForHidden(this.selectors.modalOverlay);
  }

  /**
   * Triggers the delayed action and verifies its completion message.
   * @param {string} expectedSnippet - Piece of text expected in the result.
   */
  async triggerAndVerifyDelayedAction(expectedSnippet: string = 'success') {
    await this.adapter.click(this.selectors.delayedButton);
    await this.waitForSelector(`${this.selectors.delayedResult}:not(:empty)`);
    const statusText = await this.adapter.getText(this.selectors.delayedResult);
    if (!statusText.toLowerCase().includes(expectedSnippet.toLowerCase())) {
      throw new Error(`Delayed action verification failed. Expected '${expectedSnippet}' in '${statusText}'`);
    }
  }

  /**
   * Verifies that the data grid contains at least a certain number of rows.
   * @param {number} minRows 
   */
  async verifyMinTableRowCount(minRows: number) {
    const actualCount = await this.adapter.countElements(this.selectors.tableRows);
    if (actualCount < minRows) {
      throw new Error(`Table row count verification failed. Expected at least ${minRows} rows, but found ${actualCount}`);
    }
  }
}

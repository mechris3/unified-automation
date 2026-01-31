import { BasePage } from './BasePage';

/**
 * [PageName]Page Template
 * 
 * Replace [PageName] with the name of your page (e.g., DashboardPage).
 * Encapsulate all elements and low-level interactions here.
 */
export class [PageName]Page extends BasePage {
  /**
   * Private selectors to encapsulate UI details.
   * Prefer [data-testid] for resilience.
   */
  private readonly selectors = {
    // example: loginButton: '[data-testid="login-btn"]',
  };

  /**
   * Action Methods: Describe the "How"
   * e.g., login(), submitForm(), logout()
   */
  async myAction() {
    // await this.adapter.click(this.selectors.example);
  }

  /**
   * Verification Methods: Describe the "Result"
   * e.g., verifyTitle(), verifySuccessMessage()
   * Always throw an Error on failure to fail the journey.
   */
  async verifyResult() {
    // const text = await this.adapter.getText(this.selectors.example);
    // if (!text.includes('Success')) throw new Error('Verification failed!');
  }
}

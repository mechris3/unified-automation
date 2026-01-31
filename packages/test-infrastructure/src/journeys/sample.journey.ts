import { BaseJourney } from '../BaseJourney';
import { TestAppPage } from '../page-objects/test-app.page';

/**
 * SampleJourney class demonstrating various automation interactions against the Test App.
 * Extends BaseJourney for cleaner lifecycle management and architectural alignment.
 */
export class SampleJourney extends BaseJourney {
  /**
   * Executes the journey steps using the TestAppPage object.
   * 
   * @throws {Error} If any verification step fails.
   */
  async execute() {
    const testPage = new TestAppPage(this.adapter);
    
    // 1. Form Interaction
    await testPage.login('automation-user', 'automation-password-123');
    await testPage.verifyLoginSuccess('automation-user');
    
    // 2. Complex Interaction - Modal
    await testPage.openConfirmationModal();
    await testPage.verifyModalTitle('Confirmation');
    await testPage.confirmModal();

    // 3. Delayed Action
    await testPage.triggerAndVerifyDelayedAction('success');

    // 4. Data Grid Verification
    await testPage.verifyMinTableRowCount(3);
  }
}

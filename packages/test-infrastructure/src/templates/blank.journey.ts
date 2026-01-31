import { BaseJourney } from '../BaseJourney';
import { [PageName]Page } from '../page-objects/[page-name].page';

/**
 * [JourneyName]Journey Template
 * 
 * Replace [JourneyName] with the name of your flow (e.g., LoginSuccessJourney).
 * Journeys focus on orchestrating higher-level Page Object methods.
 */
export class [JourneyName]Journey extends BaseJourney {
  /**
   * Standard execution path.
   * setup() (navigation to APP_URL) is called automatically before this.
   */
  async execute() {
    // 1. Initialize Page Objects
    // const myPage = new [PageName]Page(this.adapter);

    // 2. Orchestrate Flow
    // await myPage.myAction();
    
    // 3. Verify Outcome
    // await myPage.verifyResult();
  }
}

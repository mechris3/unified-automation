import { UnifiedAdapter } from '@unified-automation/adapters';
import { config } from './config/config';

/**
 * Base class for all automation journeys.
 * 
 * Manages the lifecycle of a journey, including setup, execution, 
 * and provides a clean, decoupled architecture.
 * 
 * @abstract
 */
export abstract class BaseJourney {
  /**
   * Start time of the journey for performance tracking.
   */
  protected startTime!: number;

  /**
   * @param {UnifiedAdapter} adapter - The unified browser adapter instance.
   */
  constructor(protected adapter: UnifiedAdapter) {}

  /**
   * Sets up the journey environment.
   * Navigates to the application URL defined in config.
   */
  async setup(): Promise<void> {
    this.startTime = Date.now();
    await this.adapter.navigate(config.appUrl);
  }

  /**
   * Finalizes the journey.
   * Logs execution time and status.
   */
  async finish(): Promise<void> {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.info(`⏱️ Journey execution time: ${duration} seconds`);
  }

  /**
   * Core execution logic of the journey.
   * To be implemented by subclasses.
   * 
   * @abstract
   */
  abstract execute(): Promise<void>;

  /**
   * Runs the complete journey lifecycle: setup -> execute -> finish.
   * 
   * @returns {Promise<void>}
   */
  async run(): Promise<void> {
    try {
      await this.setup();
      await this.execute();
      await this.finish();
    } catch (error) {
      throw error;
    }
  }
}

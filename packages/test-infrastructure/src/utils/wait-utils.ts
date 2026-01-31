/**
 * Polls a condition until it's met or timeout is reached.
 * 
 * Useful for waiting on async state updates in the UI where the exact timing is unpredictable.
 * Instead of arbitrary waits, this polls the actual value until the expected condition is true.
 * 
 * @template T - The type of value being polled
 * @param getValue - Async function that retrieves the current value to check
 * @param condition - Predicate function that returns true when the condition is met
 * @param options - Configuration options
 * @param options.timeout - Maximum time to wait in milliseconds (default: 5000)
 * @param options.interval - Time between polling attempts in milliseconds (default: 250)
 * @param options.errorMessage - Custom error message if condition is not met (default: 'Condition not met within timeout')
 * @returns Promise that resolves with the value when condition is met
 * @throws Error if condition is not met within the timeout period
 */
export async function waitForCondition<T>(
  getValue: () => Promise<T>,
  condition: (value: T) => boolean,
  options: {
    timeout?: number;
    interval?: number;
    errorMessage?: string;
  } = {}
): Promise<T> {
  const { timeout = 5000, interval = 250, errorMessage = 'Condition not met within timeout' } = options;
  const maxAttempts = Math.ceil(timeout / interval);
  
  for (let i = 0; i < maxAttempts; i++) {
    const value = await getValue();
    if (condition(value)) {
      return value;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  const finalValue = await getValue();
  if (condition(finalValue)) {
    return finalValue;
  }
  
  throw new Error(errorMessage);
}

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
  
  throw new Error(`${errorMessage}. Actual value: "${finalValue}"`);
}

export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Retry failed');
}

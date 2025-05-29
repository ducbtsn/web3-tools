export const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  
  /**
   * Original function
   * @link https://github.com/franckLdx/ts-retry/blob/master/src/retry/retry.ts
   * @param fn
   * @param delay
   * @param maxRetries
   */
  export async function retry<T>(
    fn: () => Promise<T>,
    delay: number,
    maxRetries: number,
  ): Promise<T> {
    return await recall(fn, delay, 0, maxRetries);
  }
  
  async function recall<T>(
    fn: () => T,
    delay: number,
    retries: number,
    maxRetries: number,
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (retries > maxRetries) {
        console.error(err, 'Max retries exceeded');
        throw err;
      }
      await wait(delay);
    }
  
    return await recall(fn, delay, retries + 1, maxRetries);
  }
  
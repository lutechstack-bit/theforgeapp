/**
 * Wraps a promise with a timeout that rejects if the promise doesn't resolve within the specified time.
 * This ensures that React Query moves to isError state instead of staying in isLoading forever.
 * 
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds (default: 12000ms / 12 seconds)
 * @param label - Optional label for error messages
 * @returns The result of the promise or throws a timeout error
 */
export function promiseWithTimeout<T>(
  promise: Promise<T> | PromiseLike<T>,
  timeoutMs: number = 12000,
  label: string = 'Request'
): Promise<T> {
  // Convert PromiseLike to proper Promise if needed
  const wrappedPromise = Promise.resolve(promise);
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`FORGE_TIMEOUT: ${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    wrappedPromise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Check if an error is a timeout error from promiseWithTimeout
 */
export function isTimeoutError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('FORGE_TIMEOUT:');
}

/**
 * A softer version that returns null on timeout instead of throwing
 * Used for non-critical background fetches where we want to continue even if it fails
 */
export function promiseWithSoftTimeout<T>(
  promise: Promise<T> | PromiseLike<T>,
  timeoutMs: number = 12000,
  label: string = 'Request'
): Promise<{ data: T | null; timedOut: boolean; error: Error | null }> {
  // Convert PromiseLike to proper Promise if needed
  const wrappedPromise = Promise.resolve(promise);
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn(`[Timeout] ${label} timed out after ${timeoutMs}ms`);
      resolve({ data: null, timedOut: true, error: null });
    }, timeoutMs);

    wrappedPromise
      .then((result) => {
        clearTimeout(timeoutId);
        resolve({ data: result, timedOut: false, error: null });
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        resolve({ data: null, timedOut: false, error });
      });
  });
}

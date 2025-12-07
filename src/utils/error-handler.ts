import { logger } from "./logger.ts";

/**
 * Handle error and exit
 */
export function handleError(error: unknown, context: string): never {
  logger.error(`${context}: ${error}`);
  Deno.exit(1);
}

/**
 * Wrap async function with error handling
 */
export async function wrapAsyncError<T>(
  fn: () => Promise<T>,
  context: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, context);
  }
}

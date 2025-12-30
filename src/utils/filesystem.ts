import { logger } from "./logger.ts";
import { ERROR_MESSAGES } from "../constants.ts";

/**
 * Ensure directory exists, create if not
 */
export async function ensureDir(path: string): Promise<void> {
  try {
    await Deno.mkdir(path, { recursive: true });
    logger.debug(`Created directory: ${path}`);
  } catch (error) {
    logger.error(ERROR_MESSAGES.CREATE_DIR_FAILED(error));
    Deno.exit(1);
  }
}

/**
 * Safely read text file, return null if not found
 */
export async function safeReadTextFile(path: string): Promise<string | null> {
  try {
    return await Deno.readTextFile(path);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return null;
    }
    logger.error(ERROR_MESSAGES.READ_FILE_FAILED(path, error));
    Deno.exit(1);
  }
}

/**
 * Safely write text file
 */
export async function safeWriteTextFile(
  path: string,
  content: string,
): Promise<void> {
  try {
    await Deno.writeTextFile(path, content);
  } catch (error) {
    logger.error(ERROR_MESSAGES.WRITE_FILE_FAILED(path, error));
    Deno.exit(1);
  }
}

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
}

/**
 * Remove a file if it exists, log warning if not found, throw on other errors
 * @param filePath - Absolute path to the file to remove
 * @returns true if removed, false if not found
 */
export async function removeFileIfExists(filePath: string): Promise<boolean> {
  try {
    await Deno.remove(filePath);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.warn(`File not found (skipping): ${filePath}`);
      return false;
    }
    throw error;
  }
}

/**
 * Remove a directory recursively if it exists, log warning if not found, throw on other errors
 * @param dirPath - Absolute path to the directory to remove
 * @returns true if removed, false if not found
 */
export async function removeDirectoryIfExists(
  dirPath: string,
): Promise<boolean> {
  try {
    await Deno.remove(dirPath, { recursive: true });
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.warn(`Directory not found (skipping): ${dirPath}`);
      return false;
    }
    throw error;
  }
}

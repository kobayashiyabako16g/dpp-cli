/**
 * Git clone utilities for plugin installation
 */

import { exists } from "@std/fs";
import { logger } from "./logger.ts";

/**
 * Check if git is installed on the system
 * @throws {Error} If git is not installed
 */
export async function checkGitInstalled(): Promise<void> {
  try {
    const command = new Deno.Command("git", {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await command.output();

    if (code !== 0) {
      throw new Error("Git command failed");
    }
  } catch (error) {
    throw new Error(
      `Git is not installed or not available in PATH.\n` +
        `Please install git to use this feature.\n` +
        `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Clone a git repository to the target directory
 * @param url Git repository URL
 * @param targetDir Target directory path
 * @param timeout Timeout in milliseconds (default: 60000)
 * @throws {Error} If clone fails
 */
export async function cloneRepository(
  url: string,
  targetDir: string,
  timeout: number = 60000,
): Promise<void> {
  // Extract repo name from target directory for logging
  const repoName = targetDir.split("/repos/github.com/")[1] || targetDir;

  // Check if repository already exists
  if (await exists(targetDir)) {
    logger.success(`Already exists: ${repoName}`);
    return;
  }

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const command = new Deno.Command("git", {
      args: ["clone", "--depth", "1", url, targetDir],
      stdout: "piped",
      stderr: "piped",
      signal: controller.signal,
    });

    const { code, stderr } = await command.output();
    clearTimeout(timeoutId);

    if (code !== 0) {
      const errorMessage = new TextDecoder().decode(stderr);
      throw new Error(
        `Git clone failed with exit code ${code}:\n${errorMessage}`,
      );
    }

    logger.success(`Cloned ${repoName}`);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      logger.error(`Failed to clone ${repoName}: Timeout after ${timeout}ms`);
      throw new Error(`Git clone timeout for ${repoName}`);
    }

    logger.error(
      `Failed to clone ${repoName}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    throw error;
  }
}

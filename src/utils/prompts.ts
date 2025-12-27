import { Select } from "@cliffy/prompt";
import type { EditorType, TemplateType } from "../constants.ts";
import type { EditorDetectionResult } from "./editor-detection.ts";
import { logger } from "./logger.ts";

/**
 * Check if the current environment is interactive (TTY available)
 * @returns True if TTY is available, false otherwise
 */
export function isInteractive(): boolean {
  return Deno.stdin.isTerminal();
}

/**
 * Prompt user to select an editor based on detected editors
 * @param detection Editor detection result
 * @returns Selected editor type
 * @throws Error if no editors are detected
 */
export async function promptForEditor(
  detection: EditorDetectionResult,
): Promise<EditorType> {
  const options: Array<{ name: string; value: EditorType }> = [];

  // Build options based on detected editors (nvim first for priority)
  if (detection.nvim) {
    const versionStr = detection.versions?.nvim
      ? ` (v${detection.versions.nvim})`
      : "";
    options.push({
      name: `Neovim${versionStr}`,
      value: "nvim",
    });
  }

  if (detection.vim) {
    const versionStr = detection.versions?.vim
      ? ` (v${detection.versions.vim})`
      : "";
    options.push({
      name: `Vim${versionStr}`,
      value: "vim",
    });
  }

  // Error if no editors detected
  if (options.length === 0) {
    logger.error("No editor detected on your system.");
    logger.error("");
    logger.error("Please install Vim or Neovim:");
    logger.error("  - Neovim: https://neovim.io/");
    logger.error("  - Vim: https://www.vim.org/");
    logger.error("");
    logger.error("Or specify an editor explicitly:");
    logger.error("  dpp init --editor nvim");
    throw new Error("No editor detected");
  }

  // If only one editor is detected, still show prompt with it as default
  const defaultValue = detection.nvim ? "nvim" : "vim";

  try {
    const editor = await Select.prompt({
      message: "Select your editor:",
      options,
      default: defaultValue,
    }) as EditorType;

    return editor;
  } catch (error) {
    // Handle Ctrl+C interruption
    if (error instanceof Deno.errors.Interrupted) {
      logger.info("\nOperation cancelled");
      Deno.exit(0);
    }
    throw error;
  }
}

/**
 * Prompt user to select a template type
 * @returns Selected template type
 */
export async function promptForTemplate(): Promise<TemplateType> {
  const options = [
    {
      name: "Minimal - Essential plugins only (recommended for beginners)",
      value: "minimal" as TemplateType,
    },
    {
      name: "Scaffold - With example plugins and configurations",
      value: "scaffold" as TemplateType,
    },
  ];

  try {
    const template = await Select.prompt({
      message: "Select template type:",
      options,
      default: "minimal",
    }) as TemplateType;

    return template;
  } catch (error) {
    // Handle Ctrl+C interruption
    if (error instanceof Deno.errors.Interrupted) {
      logger.info("\nOperation cancelled");
      Deno.exit(0);
    }
    throw error;
  }
}

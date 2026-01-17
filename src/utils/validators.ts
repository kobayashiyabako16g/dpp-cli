import { logger } from "./logger.ts";
import { getProfile } from "./global-config.ts";
import type { Profile } from "../types/config.ts";
import {
  type ConfigFormat,
  type EditorType,
  ERROR_MESSAGES,
  SUPPORTED_EDITORS,
  SUPPORTED_FORMATS,
  SUPPORTED_TEMPLATES,
  type TemplateType,
} from "../constants.ts";

/**
 * Validate editor type and exit if invalid
 */
export function validateEditor(editor: string): asserts editor is EditorType {
  if (!SUPPORTED_EDITORS.includes(editor as EditorType)) {
    logger.error(ERROR_MESSAGES.INVALID_EDITOR(editor));
    Deno.exit(1);
  }
}

/**
 * Validate configuration format and exit if invalid
 */
export function validateFormat(format: string): asserts format is ConfigFormat {
  if (!SUPPORTED_FORMATS.includes(format as ConfigFormat)) {
    logger.error(ERROR_MESSAGES.INVALID_FORMAT(format));
    Deno.exit(1);
  }
}

/**
 * Validate template type and exit if invalid
 */
export function validateTemplate(
  template: string,
): asserts template is TemplateType {
  if (!SUPPORTED_TEMPLATES.includes(template as TemplateType)) {
    logger.error(ERROR_MESSAGES.INVALID_TEMPLATE(template));
    Deno.exit(1);
  }
}

/**
 * Get profile and exit if not found
 */
export async function requireProfile(
  profileName?: string,
): Promise<Profile> {
  const profile = await getProfile(profileName);
  if (!profile) {
    logger.error(ERROR_MESSAGES.NO_PROFILE);
    Deno.exit(1);
  }
  return profile;
}

/**
 * Validate that command is allowed for the profile's template.
 * Exits with error if minimal template is used.
 */
export function validateCommandForTemplate(
  profile: Profile,
  commandName: "add" | "remove",
): void {
  if (profile.template === "minimal") {
    logger.error(`
The '${commandName}' command is not available for minimal template.
  
The minimal template uses a static plugin configuration.
To manage plugins dynamically, please re-initialize with:
    dpp init --template scaffold`);
    Deno.exit(1);
  }
}

/**
 * Normalize repository format to owner/repo.
 * Accepts:
 *  - owner/repo (returned as-is)
 *  - https://github.com/owner/repo
 *  - https://github.com/owner/repo.git
 *  - git@github.com:owner/repo
 *  - git@github.com:owner/repo.git
 *
 * Only supports GitHub repositories.
 * Exits with error if format is invalid.
 */
export function normalizeRepoFormat(repo: string): string {
  // Pattern 1: HTTPS URL - https://github.com/owner/repo(.git)?
  const httpsMatch = repo.match(
    /^https:\/\/github\.com\/([\w-]+\/[\w.-]+?)(\.git)?$/i,
  );
  if (httpsMatch) {
    return httpsMatch[1];
  }

  // Pattern 2: SSH URL - git@github.com:owner/repo(.git)?
  const sshMatch = repo.match(
    /^git@github\.com:([\w-]+\/[\w.-]+?)(\.git)?$/i,
  );
  if (sshMatch) {
    return sshMatch[1];
  }

  // Pattern 3: owner/repo format (validate and return)
  const ownerRepoPattern = /^[\w-]+\/[\w.-]+$/;
  if (ownerRepoPattern.test(repo)) {
    return repo;
  }

  // Invalid format
  logger.error(ERROR_MESSAGES.INVALID_REPO_FORMAT(repo));
  Deno.exit(1);
}

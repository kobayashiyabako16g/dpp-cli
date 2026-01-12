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
    logger.error(
      `The '${commandName}' command is not available for minimal template.\n` +
        `The minimal template uses a static plugin configuration.\n` +
        `To manage plugins dynamically, please re-initialize with:\n` +
        `  dpp init --template scaffold`,
    );
    Deno.exit(1);
  }
}

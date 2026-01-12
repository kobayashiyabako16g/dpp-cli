import { define } from "gunshi";
import { logger } from "../utils/logger.ts";
import { requireProfile } from "../utils/validators.ts";
import { getTargetToml } from "../utils/global-config.ts";
import { launchEditor } from "../utils/editor-launcher.ts";
import { ERROR_MESSAGES } from "../constants.ts";

export const editCommand = define({
  name: "edit",
  description: "Edit dpp configuration file in your preferred editor",
  args: {
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const { profile: profileName } = ctx.values;

    // Get profile (validates it exists)
    const profile = await requireProfile(profileName);

    // Get target TOML file path
    const tomlPath = await getTargetToml(undefined, profile);

    // Check if the TOML file exists
    try {
      await Deno.stat(tomlPath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        logger.error(ERROR_MESSAGES.TOML_NOT_FOUND(tomlPath));
        Deno.exit(1);
      }
      throw error;
    }

    // Launch editor and wait for it to close
    try {
      await launchEditor(tomlPath);
    } catch (error) {
      logger.error(ERROR_MESSAGES.EDITOR_LAUNCH_FAILED(error));
      Deno.exit(1);
    }

    // Exit silently on success (sheldon-style behavior)
  },
});

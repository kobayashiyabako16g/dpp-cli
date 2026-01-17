import { define } from "gunshi";
import { logger } from "../utils/logger.ts";
import {
  normalizeRepoFormat,
  requireProfile,
  validateCommandForTemplate,
} from "../utils/validators.ts";
import {
  getConfigHandler,
  getTomlPath,
  notifyTomlUsage,
} from "../utils/config-handler.ts";
import { ERROR_MESSAGES } from "../constants.ts";

export const removeCommand = define({
  name: "remove",
  description: "Remove a plugin from dpp.vim configuration",
  args: {
    repo: {
      type: "positional",
      description: "Plugin repository to remove",
      required: true,
    },
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const { repo, profile: profileName } = ctx.values;

    // Get profile (validates it exists)
    const profile = await requireProfile(profileName);
    validateCommandForTemplate(profile, "remove");

    // Normalize repository format
    const normalizedRepo = normalizeRepoFormat(repo);

    // Get TOML path from profile
    const tomlPath = getTomlPath(profile);
    const fileExt = profile.mainConfig.split(".").pop()!;

    // Notify about TOML usage for non-TOML formats
    notifyTomlUsage(fileExt);

    try {
      // All formats use TOML for plugin management
      const handler = getConfigHandler();
      const removed = await handler.removePlugin(tomlPath, normalizedRepo);

      if (!removed) {
        logger.warn(ERROR_MESSAGES.PLUGIN_NOT_FOUND(normalizedRepo));
        Deno.exit(1);
      }

      logger.success(`Removed ${normalizedRepo} from dpp.toml`);
    } catch (error) {
      logger.error(`Failed to remove plugin: ${error}`);
      Deno.exit(1);
    }

    logger.info(`
Plugin removed successfully!
Next steps:
1. Open Vim/Neovim and run:
   :DppMakeState
   (or restart your editor)
2. Note: The plugin directory remains in cache.
   Use 'dpp clean' to remove all cached plugins.
    `);
  },
});

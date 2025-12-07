import { define } from "gunshi";
import { logger } from "../utils/logger.ts";
import { requireProfile } from "../utils/validators.ts";
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
    const repo = ctx.values.repo as string;
    const profileName = ctx.values.profile as string | undefined;

    // Get profile (validates it exists)
    const profile = await requireProfile(profileName);

    // Get TOML path from profile
    const tomlPath = getTomlPath(profile);
    const fileExt = profile.mainConfig.split(".").pop()!;

    // Notify about TOML usage for non-TOML formats
    notifyTomlUsage(fileExt);

    try {
      // All formats use TOML for plugin management
      const handler = getConfigHandler();
      const removed = await handler.removePlugin(tomlPath, repo);

      if (!removed) {
        logger.warn(ERROR_MESSAGES.PLUGIN_NOT_FOUND(repo));
        Deno.exit(1);
      }

      logger.success(`Removed ${repo} from dpp.toml`);
    } catch (error) {
      logger.error(`Failed to remove plugin: ${error}`);
      Deno.exit(1);
    }

    logger.info("\nPlugin removed successfully!");
    logger.info("Note: The plugin directory will be kept in cache.");
    logger.info("To clean up, manually delete:");
    logger.info(`  ~/.cache/dpp/repos/github.com/${repo}`);
  },
});


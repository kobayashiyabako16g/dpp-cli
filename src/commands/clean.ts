import { define } from "gunshi";
import { join } from "@std/path";
import { deleteProfile, getProfile } from "../utils/global-config.ts";
import {
  removeDirectoryIfExists,
  removeFileIfExists,
} from "../utils/filesystem.ts";
import { logger } from "../utils/logger.ts";
import { Confirm } from "@cliffy/prompt";
import { isInteractive } from "../utils/prompts.ts";
import { resolveDppPaths } from "../utils/paths.ts";

export const cleanCommand = define({
  name: "clean",
  description: "Remove all dpp configuration files, cache, and profile",
  args: {
    profile: {
      type: "string",
      description: "Profile name to clean (default: active profile)",
      short: "p",
    },
    force: {
      type: "boolean",
      description: "Skip confirmation prompt",
      short: "f",
      default: false,
    },
  },
  run: async (ctx) => {
    const { profile: profileName, force } = ctx.values;

    // Get profile
    const profile = await getProfile(profileName);
    if (!profile) {
      logger.error(
        `Profile "${profileName || "active"}" not found. Run 'dpp init' first.`,
      );
      Deno.exit(1);
    }

    // Build list of items to delete
    const configFiles: string[] = [];
    const cacheItems: string[] = [];

    // Determine format from mainConfig extension
    const format = profile.mainConfig.split(".").pop() as "lua" | "vim" | "ts";

    // Resolve paths using the same logic as init command
    const paths = resolveDppPaths({
      configDir: profile.configDir,
      format,
      editor: profile.editor,
    });

    // Main config file (use resolved path from resolveDppPaths)
    configFiles.push(paths.configFile);

    // TypeScript config file
    if (profile.tsConfigFile) {
      configFiles.push(profile.tsConfigFile);
    }

    // TOML files
    for (const tomlFile of profile.tomlFiles) {
      configFiles.push(tomlFile.path);
    }

    // Cache directory
    if (profile.cacheDir) {
      cacheItems.push(profile.cacheDir);
    }

    // Display deletion list
    logger.info("\n=== Items to be deleted ===\n");

    logger.info("Configuration files:");
    for (const file of configFiles) {
      console.log(`  - ${file}`);
    }

    if (cacheItems.length > 0) {
      logger.info("\nCache:");
      for (const item of cacheItems) {
        console.log(`  - ${item}`);
      }
    }

    logger.info("\nProfile:");
    console.log(`  - ${profile.name} (from global config)`);
    console.log("");

    // Confirmation prompt
    if (!force) {
      // Check if running in interactive mode
      if (!isInteractive()) {
        logger.error(
          "Cannot run in non-interactive mode without --force flag.\n" +
            "Use 'dpp clean --force' to skip confirmation.",
        );
        Deno.exit(1);
      }

      const confirmed = await Confirm.prompt({
        message: `Are you sure you want to delete all items listed above?`,
        default: false,
      });

      if (!confirmed) {
        logger.info("Clean operation cancelled.");
        return;
      }
    }

    // Delete configuration files
    logger.info("\nRemoving configuration files...");
    for (const file of configFiles) {
      await removeFileIfExists(file);
    }

    // Delete cache directory
    if (cacheItems.length > 0) {
      logger.info("Removing cache directory...");
      for (const item of cacheItems) {
        await removeDirectoryIfExists(item);
      }
    }

    // Delete profile
    logger.info("Removing profile from global configuration...");
    try {
      await deleteProfile(profile.name);
    } catch (error) {
      logger.error(`Failed to delete profile: ${error}`);
      Deno.exit(1);
    }

    logger.success(`\n✓ Successfully cleaned profile "${profile.name}"`);
  },
});

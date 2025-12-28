import { define } from "gunshi";
import { logger } from "../utils/logger.ts";
import type { Plugin } from "@shougo/dpp-vim/types";
import { requireProfile } from "../utils/validators.ts";
import {
  getConfigHandler,
  getTomlPath,
  notifyTomlUsage,
} from "../utils/config-handler.ts";

export const addCommand = define({
  name: "add",
  description: "Add a plugin to dpp.vim configuration",
  args: {
    repo: {
      type: "positional",
      description: "Plugin repository (e.g., Shougo/ddu.vim)",
      required: true,
    },
    onCmd: {
      type: "string",
      description: "Command lazy loading",
    },
    onFt: {
      type: "string",
      description: "Filetype lazy loading",
    },
    onEvent: {
      type: "string",
      description: "Event lazy loading",
    },
    depends: {
      type: "string",
      description: "Plugin dependencies (comma-separated)",
    },
    frozen: {
      type: "boolean",
      description: "Freeze plugin version",
    },
    branch: {
      type: "string",
      short: "b",
      description: "Specify branch",
    },
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const {
      repo,
      onCmd,
      onFt,
      onEvent,
      depends,
      branch,
      profile: profileName,
    } = ctx.values;

    // Get profile (validates it exists)
    const profile = await requireProfile(profileName);

    // Build plugin configuration
    const plugin: Partial<Plugin> & { repo: string } = { repo };

    if (onCmd) {
      plugin.on_cmd = onCmd.split(",").map((s) => s.trim());
    }
    if (onFt) {
      plugin.on_ft = onFt.split(",").map((s) => s.trim());
    }
    if (onEvent) {
      plugin.on_event = onEvent.split(",").map((s) => s.trim());
    }
    if (depends) {
      plugin.depends = depends.split(",").map((s) => s.trim());
    }
    // Note: frozen is handled by dpp.vim, not in Plugin type
    if (branch) {
      plugin.rev = branch;
    }

    // Get TOML path from profile
    const tomlPath = getTomlPath(profile);
    const fileExt = profile.mainConfig.split(".").pop()!;

    // Notify about TOML usage for non-TOML formats
    notifyTomlUsage(fileExt);

    try {
      // All formats use TOML for plugin management
      const handler = getConfigHandler();
      await handler.addPlugin(tomlPath, plugin);
      logger.success(`Added ${repo} to dpp.toml`);
    } catch (error) {
      logger.error(`Failed to add plugin: ${error}`);
      Deno.exit(1);
    }

    logger.info(`
Plugin added successfully!
Next steps:
1. Review your plugins:
   ${tomlPath}
2. Restart Vim/Neovim to load the new plugin
    `);
  },
});

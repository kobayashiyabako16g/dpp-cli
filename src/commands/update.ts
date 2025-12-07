import { define } from "gunshi";
import { logger } from "../utils/logger.ts";
import { requireProfile } from "../utils/validators.ts";
import { DEFAULT_PARALLEL_COUNT } from "../constants.ts";

export const updateCommand = define({
  name: "update",
  description: "Update plugins (delegates to dpp.vim)",
  args: {
    repos: {
      type: "string",
      description: "Plugin repositories to update (comma-separated, optional)",
    },
    all: {
      type: "boolean",
      description: "Update all plugins",
      default: false,
    },
    parallel: {
      type: "number",
      description: "Number of parallel operations",
      default: DEFAULT_PARALLEL_COUNT,
    },
    dryRun: {
      type: "boolean",
      description: "Show what would be updated without updating",
      default: false,
    },
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const reposString = ctx.values.repos as string | undefined;
    const repos = reposString ? reposString.split(",").map((s) => s.trim()) : undefined;
    const all = ctx.values.all as boolean;
    const parallel = ctx.values.parallel as number;
    const dryRun = ctx.values.dryRun as boolean;
    const profileName = ctx.values.profile as string | undefined;

    // Get profile (validates it exists)
    const profile = await requireProfile(profileName);

    if (!all && (!repos || repos.length === 0)) {
      logger.error("Specify --all or provide plugin repositories to update");
      Deno.exit(1);
    }

    if (dryRun) {
      logger.info("Dry run mode - no changes will be made");
    }

    logger.info("Plugin updates are managed by dpp.vim itself.");
    logger.info("\nTo update plugins, run these commands in Vim/Neovim:");
    logger.info("");
    logger.info("  " + (profile.editor === "nvim" ? "nvim" : "vim"));
    logger.info("  :call dpp#async_ext_action('installer', 'update')");
    logger.info("");
    logger.info("Or for specific plugins:");
    logger.info("  :call dpp#async_ext_action('installer', 'update', {");
    logger.info("  \\   'plugins': ['plugin-name'],");
    logger.info("  \\ })");
    logger.info("");
    logger.info("Configuration:");
    logger.info(`  Profile: ${profile.name}`);
    logger.info(`  Config: ${profile.configDir}/${profile.mainConfig}`);
    logger.info(`  Parallel: ${parallel}`);

    if (repos && repos.length > 0) {
      logger.info(`  Repos: ${repos.join(", ")}`);
    }

    logger.info("\nNote: This CLI delegates plugin installation/updates to dpp.vim");
    logger.info("for consistency with dpp.vim's architecture.");
  },
});

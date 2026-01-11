import { define } from "gunshi";
import { join } from "@std/path";
import { resolveDppPaths } from "../utils/paths.ts";
import { createDefaultProfile, saveProfile } from "../utils/global-config.ts";
import { logger } from "../utils/logger.ts";
import { validateEditor, validateTemplate } from "../utils/validators.ts";
import {
  ensureDir,
  fileExists,
  safeReadTextFile,
} from "../utils/filesystem.ts";
import { DEFAULT_PROFILE_NAME } from "../constants.ts";
import { detectInstalledEditors } from "../utils/editor-detection.ts";
import {
  isInteractive,
  promptForEditor,
  promptForTemplate,
} from "../utils/prompts.ts";
import { Confirm } from "@cliffy/prompt";
import { getTemplateHandler } from "../templates/registry.ts";

/**
 * Check if init.lua or init.vim already contains dpp configuration
 */
async function checkInitFileForDpp(
  initFilePath: string,
  editor: "vim" | "nvim",
): Promise<boolean> {
  const content = await safeReadTextFile(initFilePath);
  if (!content) return false;

  // Check for various forms of require('dpp_config') or call dpp#load()
  const pattern = editor === "nvim"
    ? /require\s*[\(\['"\]\s*dpp_config\s*[\)\]'"]/
    : /call\s+dpp#load\s*\(/;

  return pattern.test(content);
}

/**
 * Update init.lua or init.vim to load dpp configuration
 * Creates a backup before modification
 */
async function updateInitFile(
  initFilePath: string,
  editor: "vim" | "nvim",
): Promise<string> {
  // Create backup directory
  const home = Deno.env.get("HOME") || "~";
  const backupDir = join(home, ".cache", "dpp-cli", "backups");
  await ensureDir(backupDir);

  // Generate timestamp for backup filename
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(
    0,
    -5,
  );
  const backupPath = join(
    backupDir,
    `init.${editor === "nvim" ? "lua" : "vim"}.${timestamp}`,
  );

  // Read current content and create backup
  const content = await Deno.readTextFile(initFilePath);
  await Deno.writeTextFile(backupPath, content);

  // Prepare content to append
  const appendContent = editor === "nvim"
    ? "\n-- Load dpp.vim configuration\nrequire('dpp_config')\n"
    : '\n" Load dpp.vim configuration\ncall dpp#load()\n';

  // Append to init file
  await Deno.writeTextFile(initFilePath, content + appendContent);

  return backupPath;
}

/**
 * Create a new init.lua or init.vim file with dpp configuration
 */
async function createInitFile(
  initFilePath: string,
  editor: "vim" | "nvim",
): Promise<void> {
  const content = editor === "nvim"
    ? `-- init.lua
-- Neovim configuration

-- Load dpp.vim configuration
require('dpp_config')
`
    : `" init.vim
" Vim configuration

" Load dpp.vim configuration
call dpp#load()
`;

  await Deno.writeTextFile(initFilePath, content);
}

export const initCommand = define({
  name: "init",
  description: "Initialize dpp.vim configuration",
  args: {
    path: {
      type: "string",
      short: "p",
      description: "Configuration file path",
    },
    template: {
      type: "enum",
      choices: ["minimal", "scaffold"] as const,
      short: "t",
      description: "Template to use",
    },
    editor: {
      type: "enum",
      choices: ["vim", "nvim"] as const,
      short: "e",
      description: "Target editor",
    },
    profile: {
      type: "string",
      description: "Profile name",
      default: DEFAULT_PROFILE_NAME,
    },
  },
  run: async (ctx) => {
    const { path, profile: profileName } = ctx.values;
    let { template, editor } = ctx.values;

    // Auto-detect and prompt for editor if not provided
    if (!editor) {
      const detection = await detectInstalledEditors();

      if (isInteractive()) {
        // Interactive mode: show prompt with detected editors
        editor = await promptForEditor(detection);
      } else {
        // Non-interactive mode (CI/scripts): use detected editor or error
        if (detection.detected) {
          editor = detection.detected;
          logger.info(
            `Non-interactive mode: using detected editor (${editor})`,
          );
        } else {
          logger.error(`No editor detected in non-interactive mode.
Please specify an editor: dpp init --editor nvim         
            `);
          Deno.exit(1);
        }
      }
    }

    // Prompt for template if not provided and in interactive mode
    if (!template) {
      if (isInteractive()) {
        template = await promptForTemplate();
      } else {
        // Default to minimal in non-interactive mode
        template = "minimal";
        logger.info("Non-interactive mode: using minimal template");
      }
    }

    // Validate inputs
    validateEditor(editor);
    validateTemplate(template);

    // Determine format based on editor
    const format = editor === "nvim" ? "lua" : "vim";

    logger.info(`Initializing dpp.vim configuration for ${editor}...`);

    // Resolve paths
    const paths = resolveDppPaths({
      configDir: path,
      format,
      editor,
    });

    // Create directories
    await ensureDir(paths.configDir);
    await ensureDir(paths.cacheDir);

    // Create editor-specific subdirectories
    if (editor === "nvim" && paths.luaDir) {
      await ensureDir(paths.luaDir);
    } else if (editor === "vim" && paths.autoloadDir) {
      await ensureDir(paths.autoloadDir);
    }

    // Initialize template using handler
    try {
      const handler = getTemplateHandler(template);
      await handler.initialize({
        editor,
        paths,
        generatedAt: new Date().toISOString(),
        profileName,
      });
    } catch (error) {
      logger.error(
        `Failed to initialize template: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }

    // Template-specific paths for profile
    const tomlPath = `${paths.configDir}/dpp.toml`;
    const tsPath = `${paths.configDir}/dpp.ts`;

    // Update init.lua or init.vim to load dpp configuration
    const initFile = editor === "nvim"
      ? join(paths.configDir, "init.lua")
      : join(paths.configDir, "init.vim");

    let initFileMessage = "";

    if (await fileExists(initFile)) {
      // Check if dpp configuration already exists
      if (await checkInitFileForDpp(initFile, editor)) {
        logger.warn(
          `${
            editor === "nvim" ? "init.lua" : "init.vim"
          } already contains dpp configuration. Skipping modification.`,
        );
        initFileMessage = `⚠️  ${
          editor === "nvim" ? "init.lua" : "init.vim"
        } already contains dpp configuration`;
      } else {
        // Backup and update init file
        try {
          const backupPath = await updateInitFile(initFile, editor);
          logger.success(
            `Updated ${editor === "nvim" ? "init.lua" : "init.vim"}`,
          );
          logger.info(`Backup created at: ${backupPath}`);
          initFileMessage = `✅ Updated ${
            editor === "nvim" ? "init.lua" : "init.vim"
          }\n  Backup: ${backupPath}`;
        } catch (error) {
          logger.error(
            `Failed to update ${
              editor === "nvim" ? "init.lua" : "init.vim"
            }: ${error}`,
          );
          initFileMessage = `❌ Failed to update ${
            editor === "nvim" ? "init.lua" : "init.vim"
          }\n  Please add manually: ${
            editor === "nvim" ? "require('dpp')" : "call dpp#load()"
          }`;
        }
      }
    } else {
      // init.lua/init.vim does not exist - prompt to create
      if (isInteractive()) {
        const shouldCreate = await Confirm.prompt({
          message: `${
            editor === "nvim" ? "init.lua" : "init.vim"
          } not found. Do you want to create it?`,
          default: true,
        });

        if (shouldCreate) {
          try {
            await createInitFile(initFile, editor);
            logger.success(
              `Created ${editor === "nvim" ? "init.lua" : "init.vim"}`,
            );
            initFileMessage = `✅ Created ${
              editor === "nvim" ? "init.lua" : "init.vim"
            } with dpp configuration`;
          } catch (error) {
            logger.error(
              `Failed to create ${
                editor === "nvim" ? "init.lua" : "init.vim"
              }: ${error}`,
            );
            initFileMessage = `❌ Failed to create ${
              editor === "nvim" ? "init.lua" : "init.vim"
            }\n  Please create manually and add: ${
              editor === "nvim" ? "require('dpp')" : "call dpp#load()"
            }`;
          }
        } else {
          logger.info(
            `Skipped creating ${
              editor === "nvim" ? "init.lua" : "init.vim"
            }. Please add the following line manually:`,
          );
          logger.info(
            editor === "nvim" ? "  require('dpp')" : "  call dpp#load()",
          );
          initFileMessage = `ℹ️  ${
            editor === "nvim" ? "init.lua" : "init.vim"
          } not created\n  Please add manually: ${
            editor === "nvim" ? "require('dpp')" : "call dpp#load()"
          }`;
        }
      } else {
        // Non-interactive mode - just show instructions
        logger.info(
          `${
            editor === "nvim" ? "init.lua" : "init.vim"
          } not found. Please add the following line manually:`,
        );
        logger.info(
          editor === "nvim" ? "  require('dpp')" : "  call dpp#load()",
        );
        initFileMessage = `ℹ️  ${
          editor === "nvim" ? "init.lua" : "init.vim"
        } not found\n  Please add manually: ${
          editor === "nvim" ? "require('dpp')" : "call dpp#load()"
        }`;
      }
    }

    // Create and save profile
    const profile = createDefaultProfile(editor);
    profile.name = profileName;
    profile.mainConfig = `dpp.${format}`;

    if (path) {
      profile.configDir = path;
    }

    // Set default TOML path
    profile.defaultToml = tomlPath;
    profile.tomlFiles = [{
      path: tomlPath,
      relativePath: "dpp.toml",
    }];

    // Save TypeScript config file and cache directory paths for clean command
    profile.tsConfigFile = tsPath;
    profile.cacheDir = paths.cacheDir;

    await saveProfile(profile);

    logger.success(`Profile '${profile.name}' created successfully`);
    logger.info(`
Config directory: ${profile.configDir}
Main config: ${profile.mainConfig}
Plugin management file: dpp.toml

Init file integration:
  ${initFileMessage}

Next steps:
  1. Edit your configuration file:
      ${paths.configFile}
  2. Manage plugins in:
      ${tomlPath}
  3. Add plugins with:
      dpp add <repo>   
    `);
  },
});

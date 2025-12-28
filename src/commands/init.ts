import { define } from "gunshi";
import { resolveDppPaths } from "../utils/paths.ts";
import { generateTemplate } from "../templates/generator.ts";
import { createDefaultProfile, saveProfile } from "../utils/global-config.ts";
import { logger } from "../utils/logger.ts";
import type { TemplateContext } from "../types/template.ts";
import { validateEditor, validateTemplate } from "../utils/validators.ts";
import { ensureDir, safeWriteTextFile } from "../utils/filesystem.ts";
import { DEFAULT_PROFILE_NAME } from "../constants.ts";
import { detectInstalledEditors } from "../utils/editor-detection.ts";
import {
  isInteractive,
  promptForEditor,
  promptForTemplate,
} from "../utils/prompts.ts";

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

    // Generate configuration file
    const content = await generateTemplate({
      editor,
      type: template,
      format,
      paths,
      generatedAt: new Date().toISOString(),
      tomlFileName: "dpp.toml",
    });
    await safeWriteTextFile(paths.configFile, content);
    logger.success(`Created configuration file: ${paths.configFile}`);

    // Create dpp.toml for plugin management (always created)
    const tomlPath = `${paths.configDir}/dpp.toml`;
    const tomlTemplate = template === "minimal"
      ? await generateTemplate({
        editor,
        type: "minimal",
        format: "toml",
        paths,
        generatedAt: new Date().toISOString(),
      })
      : await generateTemplate({
        editor,
        type: "scaffold",
        format: "toml",
        paths,
        generatedAt: new Date().toISOString(),
      });

    await safeWriteTextFile(tomlPath, tomlTemplate);
    logger.success(`Created TOML plugin file: ${tomlPath}`);

    // Create dpp.ts for dpp#make_state (TypeScript config that loads TOML)
    const tsPath = `${paths.configDir}/dpp.ts`;
    const tsTemplate = template === "minimal"
      ? await generateTemplate({
        editor,
        type: "minimal",
        format: "ts",
        paths,
        generatedAt: new Date().toISOString(),
      })
      : await generateTemplate({
        editor,
        type: "scaffold",
        format: "ts",
        paths,
        generatedAt: new Date().toISOString(),
      });

    await safeWriteTextFile(tsPath, tsTemplate);
    logger.success(`Created TypeScript config file: ${tsPath}`);

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

    await saveProfile(profile);

    logger.success(`Profile '${profile.name}' created successfully`);
    logger.info(`
Config directory: ${profile.configDir}
Main config: ${profile.mainConfig}
Plugin management file: dpp.toml

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

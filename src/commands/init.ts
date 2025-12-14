import { define } from "gunshi";
import { resolveDppPaths } from "../utils/paths.ts";
import { generateTemplate } from "../templates/generator.ts";
import {
  createDefaultProfile,
  saveProfile,
} from "../utils/global-config.ts";
import { logger } from "../utils/logger.ts";
import type { TemplateContext } from "../types/template.ts";
import {
  validateEditor,
  validateTemplate,
} from "../utils/validators.ts";
import { ensureDir, safeWriteTextFile } from "../utils/filesystem.ts";
import { DEFAULT_PROFILE_NAME } from "../constants.ts";

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
      type: "string",
      short: "t",
      description: "Template to use (minimal or scaffold)",
      default: "minimal",
    },
    editor: {
      type: "string",
      short: "e",
      description: "Target editor (vim or nvim)",
      default: "nvim",
    },
    profile: {
      type: "string",
      description: "Profile name",
      default: DEFAULT_PROFILE_NAME,
    },
  },
  run: async (ctx) => {
    const path = ctx.values.path as string | undefined;
    const template = ctx.values.template as string;
    const editor = ctx.values.editor as string;
    const profileName = ctx.values.profile as string;

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
    const templateContext: TemplateContext = {
      editor,
      type: template,
      format,
      paths,
      generatedAt: new Date().toISOString(),
      tomlFileName: "dpp.toml",
    };

    const content = await generateTemplate(templateContext);
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
    logger.info(`Config directory: ${profile.configDir}`);
    logger.info(`Main config: ${profile.mainConfig}`);
    logger.info(`Plugin management file: dpp.toml`);

    logger.info("\nNext steps:");
    logger.info("1. Edit your configuration file:");
    logger.info(`   ${paths.configFile}`);
    logger.info("2. Manage plugins in:");
    logger.info(`   ${tomlPath}`);
    logger.info("3. Add plugins with:");
    logger.info("   dpp add <repo>");
  },
});

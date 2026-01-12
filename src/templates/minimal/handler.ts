import type {
  TemplateHandler,
  TemplateHandlerContext,
} from "../../types/template.ts";
import { generateTemplate } from "../generator.ts";
import { safeWriteTextFile } from "../../utils/filesystem.ts";
import { logger } from "../../utils/logger.ts";
import { checkGitInstalled, cloneRepository } from "../../utils/git-clone.ts";

// Hardcoded minimal required plugins
const plugins = [
  { repo: "Shougo/dpp.vim" },
  { repo: "vim-denops/denops.vim" },
];

export class MinimalHandler implements TemplateHandler {
  async initialize(ctx: TemplateHandlerContext): Promise<void> {
    const { editor, paths, generatedAt } = ctx;
    const format = editor === "nvim" ? "lua" : "vim";

    // 1. Generate main configuration file
    const mainContent = await generateTemplate({
      editor,
      type: "minimal",
      format,
      paths,
      generatedAt,
      tomlFileName: "dpp.toml",
    });
    await safeWriteTextFile(paths.configFile, mainContent);
    logger.success(`Created configuration file: ${paths.configFile}`);

    // 2. Clone plugins
    logger.info("Installing plugins...");
    try {
      await checkGitInstalled();

      for (const plugin of plugins) {
        const repo = plugin.repo;
        const gitUrl = `https://github.com/${repo}.git`;
        const targetDir = `${paths.pluginsDir}/${repo}`;

        logger.info(`Cloning ${repo}...`);
        await cloneRepository(gitUrl, targetDir, 60000);
      }
    } catch (error) {
      logger.error(
        `Failed to install plugins: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw error;
    }

    // 3. Generate TypeScript config file
    const tsPath = `${paths.configDir}/dpp.ts`;
    const tsContent = await generateTemplate({
      editor,
      type: "minimal",
      format: "ts",
      paths,
      generatedAt,
    });
    await safeWriteTextFile(tsPath, tsContent);
    logger.success(`Created TypeScript config file: ${tsPath}`);
  }
}

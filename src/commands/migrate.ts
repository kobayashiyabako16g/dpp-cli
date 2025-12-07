import { define } from "gunshi";
import { join } from "@std/path";
import { exists } from "@std/fs";
import { validateFormat } from "../utils/validators.ts";

export const migrateCommand = define({
  name: "migrate",
  description: "Migrate from other plugin managers to dpp.vim",
  args: {
    from: {
      type: "string",
      description: "Plugin manager to migrate from (dein, vim-plug, packer)",
      required: true,
    },
    config: {
      type: "string",
      short: "c",
      description: "Path to the source configuration file",
    },
    "dry-run": {
      type: "boolean",
      description: "Show conversion result without creating files",
      default: false,
    },
    format: {
      type: "string",
      short: "f",
      description: "Output format for dpp.vim config (ts, toml, lua, vim)",
      default: "ts",
    },
  },
  run: async (ctx) => {
    const from = ctx.values.from as string;
    const configPath = ctx.values.config as string | undefined;
    const dryRun = ctx.values["dry-run"] as boolean;
    const format = ctx.values.format as string;

    // Validate format
    validateFormat(format);

    const supportedManagers = ["dein", "vim-plug", "packer"];
    if (!supportedManagers.includes(from)) {
      console.error(`❌ Unsupported plugin manager: ${from}`);
      console.error(`   Supported: ${supportedManagers.join(", ")}`);
      Deno.exit(1);
    }

    console.log(`🔄 Migrating from ${from} to dpp.vim...\n`);

    // Detect configuration file if not specified
    let sourceFile: string | null = configPath ?? null;
    if (!sourceFile) {
      sourceFile = await detectConfigFile(from);
      if (!sourceFile) {
        console.error(`❌ Could not find ${from} configuration file`);
        console.error("   Please specify with --config option");
        Deno.exit(1);
      }
    }

    console.log(`📄 Source: ${sourceFile}`);

    // Check if file exists
    if (!await exists(sourceFile)) {
      console.error(`❌ Configuration file not found: ${sourceFile}`);
      Deno.exit(1);
    }

    // Read source configuration
    const content = await Deno.readTextFile(sourceFile);

    // Parse and convert
    console.log(`\n🔍 Parsing ${from} configuration...`);
    const plugins = parsePluginManager(from, content);

    if (plugins.length === 0) {
      console.warn("⚠️  No plugins found in configuration");
      return;
    }

    console.log(`   Found ${plugins.length} plugins`);

    // Convert to dpp.vim format
    console.log(`\n✨ Converting to dpp.vim (${format} format)...`);
    const dppConfig = convertToDpp(plugins, format);

    if (dryRun) {
      console.log("\n" + "=".repeat(50));
      console.log("DRY RUN - Generated configuration:");
      console.log("=".repeat(50));
      console.log(dppConfig);
      console.log("=".repeat(50));
      console.log("\nRun without --dry-run to create the configuration file");
    } else {
      // Determine output path
      const home = Deno.env.get("HOME") || "~";
      const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || join(home, ".config");
      const configDir = join(xdgConfigHome, "nvim");
      const outputFile = join(configDir, `dpp.${format}`);

      // Check if file already exists
      if (await exists(outputFile)) {
        console.error(`\n❌ Output file already exists: ${outputFile}`);
        console.error("   Please backup or remove it first");
        Deno.exit(1);
      }

      // Create config directory
      await Deno.mkdir(configDir, { recursive: true });

      // Write configuration
      await Deno.writeTextFile(outputFile, dppConfig);

      console.log(`\n✅ Migration complete!`);
      console.log(`   Created: ${outputFile}`);
      console.log(`\n📝 Next steps:`);
      console.log(`   1. Review the generated configuration`);
      console.log(`   2. Run 'dpp check' to validate`);
      console.log(`   3. Update your ${format === "vim" ? "vimrc" : "init.vim/init.lua"} to load dpp.vim`);
    }
  },
});

async function detectConfigFile(manager: string): Promise<string | null> {
  const home = Deno.env.get("HOME") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || join(home, ".config");

  const candidates: Record<string, string[]> = {
    "dein": [
      join(xdgConfigHome, "nvim", "init.vim"),
      join(xdgConfigHome, "nvim", "init.lua"),
      join(home, ".vimrc"),
    ],
    "vim-plug": [
      join(xdgConfigHome, "nvim", "init.vim"),
      join(home, ".vimrc"),
    ],
    "packer": [
      join(xdgConfigHome, "nvim", "lua", "plugins.lua"),
      join(xdgConfigHome, "nvim", "init.lua"),
    ],
  };

  for (const path of candidates[manager] || []) {
    if (await exists(path)) {
      return path;
    }
  }

  return null;
}

interface ParsedPlugin {
  repo: string;
  options: Record<string, unknown>;
}

function parsePluginManager(
  manager: string,
  content: string,
): ParsedPlugin[] {
  const plugins: ParsedPlugin[] = [];

  switch (manager) {
    case "dein": {
      // Parse dein#add() calls
      const deinPattern = /call\s+dein#add\s*\(\s*['"]([^'"]+)['"]\s*(?:,\s*({[^}]*}))?\s*\)/g;
      let deinMatch;
      while ((deinMatch = deinPattern.exec(content)) !== null) {
        plugins.push({
          repo: deinMatch[1],
          options: deinMatch[2] ? parseDeinOptions(deinMatch[2]) : {},
        });
      }
      break;
    }

    case "vim-plug": {
      // Parse Plug commands
      const plugPattern = /Plug\s+['"]([^'"]+)['"](?:\s*,\s*({[^}]*}))?/g;
      let plugMatch;
      while ((plugMatch = plugPattern.exec(content)) !== null) {
        plugins.push({
          repo: plugMatch[1],
          options: plugMatch[2] ? parseVimPlugOptions(plugMatch[2]) : {},
        });
      }
      break;
    }

    case "packer": {
      // Parse packer use() calls
      const packerPattern = /use\s+(?:{[^}]*repo\s*=\s*)?['"]([^'"]+)['"]/g;
      let packerMatch;
      while ((packerMatch = packerPattern.exec(content)) !== null) {
        plugins.push({
          repo: packerMatch[1],
          options: {},
        });
      }
      break;
    }
  }

  return plugins;
}

function parseDeinOptions(optionsStr: string): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  
  // Simple parser for common dein options
  if (optionsStr.includes("on_cmd")) {
    const match = optionsStr.match(/on_cmd\s*:\s*\[([^\]]+)\]/);
    if (match) options.on_cmd = match[1].split(",").map(s => s.trim().replace(/['"]/g, ""));
  }
  
  if (optionsStr.includes("on_ft")) {
    const match = optionsStr.match(/on_ft\s*:\s*\[([^\]]+)\]/);
    if (match) options.on_ft = match[1].split(",").map(s => s.trim().replace(/['"]/g, ""));
  }

  return options;
}

function parseVimPlugOptions(optionsStr: string): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  
  if (optionsStr.includes("'for'")) {
    const match = optionsStr.match(/'for'\s*:\s*\[([^\]]+)\]/);
    if (match) options.on_ft = match[1].split(",").map(s => s.trim().replace(/['"]/g, ""));
  }

  return options;
}

function convertToDpp(plugins: ParsedPlugin[], format: string): string {
  switch (format) {
    case "ts":
      return convertToTypeScript(plugins);
    case "toml":
      return convertToToml(plugins);
    case "lua":
      return convertToLua(plugins);
    case "vim":
      return convertToVim(plugins);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function convertToTypeScript(plugins: ParsedPlugin[]): string {
  let content = `// Migrated dpp.vim configuration
import type { Plugin } from "jsr:@shougo/dpp-vim/types";

export const config = {
  plugins: [
    // Core plugins
    { repo: "Shougo/dpp.vim" },
    { repo: "vim-denops/denops.vim" },
    
    // Migrated plugins
`;

  for (const plugin of plugins) {
    const opts: string[] = [`repo: "${plugin.repo}"`];
    
    if (plugin.options.on_cmd) {
      const cmds = JSON.stringify(plugin.options.on_cmd);
      opts.push(`on_cmd: ${cmds}`);
    }
    
    if (plugin.options.on_ft) {
      const fts = JSON.stringify(plugin.options.on_ft);
      opts.push(`on_ft: ${fts}`);
    }

    content += `    { ${opts.join(", ")} },\n`;
  }

  content += `  ] satisfies Plugin[],
};
`;

  return content;
}

function convertToToml(plugins: ParsedPlugin[]): string {
  let content = `# Migrated dpp.vim configuration

[[plugins]]
repo = "Shougo/dpp.vim"

[[plugins]]
repo = "vim-denops/denops.vim"

`;

  for (const plugin of plugins) {
    content += `[[plugins]]\n`;
    content += `repo = "${plugin.repo}"\n`;
    
    if (plugin.options.on_cmd) {
      const cmds = plugin.options.on_cmd as string[];
      content += `on_cmd = ${JSON.stringify(cmds)}\n`;
    }
    
    if (plugin.options.on_ft) {
      const fts = plugin.options.on_ft as string[];
      content += `on_ft = ${JSON.stringify(fts)}\n`;
    }
    
    content += `\n`;
  }

  return content;
}

function convertToLua(plugins: ParsedPlugin[]): string {
  let content = `-- Migrated dpp.vim configuration
return {
  plugins = {
    { repo = "Shougo/dpp.vim" },
    { repo = "vim-denops/denops.vim" },
    
`;

  for (const plugin of plugins) {
    content += `    { repo = "${plugin.repo}"`;
    
    if (plugin.options.on_cmd) {
      const cmds = plugin.options.on_cmd as string[];
      content += `, on_cmd = { ${cmds.map(c => `"${c}"`).join(", ")} }`;
    }
    
    if (plugin.options.on_ft) {
      const fts = plugin.options.on_ft as string[];
      content += `, on_ft = { ${fts.map(f => `"${f}"`).join(", ")} }`;
    }
    
    content += ` },\n`;
  }

  content += `  },
}
`;

  return content;
}

function convertToVim(plugins: ParsedPlugin[]): string {
  let content = `" Migrated dpp.vim configuration
let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'

if !isdirectory(s:dpp_src)
  execute '!git clone https://github.com/Shougo/dpp.vim' s:dpp_src
endif

execute 'set runtimepath^=' .. s:dpp_src

call dpp#begin(s:dpp_base)

call dpp#add('Shougo/dpp.vim')
call dpp#add('vim-denops/denops.vim')

`;

  for (const plugin of plugins) {
    if (Object.keys(plugin.options).length === 0) {
      content += `call dpp#add('${plugin.repo}')\n`;
    } else {
      content += `call dpp#add('${plugin.repo}', {\n`;
      
      if (plugin.options.on_cmd) {
        const cmds = plugin.options.on_cmd as string[];
        content += `\\   'on_cmd': ${JSON.stringify(cmds)},\n`;
      }
      
      if (plugin.options.on_ft) {
        const fts = plugin.options.on_ft as string[];
        content += `\\   'on_ft': ${JSON.stringify(fts)},\n`;
      }
      
      content += `\\ })\n`;
    }
  }

  content += `
call dpp#end()

if dpp#check_install()
  call dpp#install()
endif
`;

  return content;
}

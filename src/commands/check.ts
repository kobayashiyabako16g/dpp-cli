import { define } from "gunshi";
import { exists } from "@std/fs";
import { parse as parseToml } from "@std/toml";
import { join } from "@std/path";
import { requireProfile } from "../utils/validators.ts";

export const checkCommand = define({
  name: "check",
  description: "Check configuration file validity",
  args: {
    strict: {
      type: "boolean",
      description: "Enable strict checking",
      default: false,
    },
    editor: {
      type: "string",
      short: "e",
      description: "Target editor to check (vim or nvim)",
    },
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const { strict, editor: targetEditor, profile: profileName } = ctx.values;

    console.log("Checking dpp.vim configuration...\n");

    const profile = await requireProfile(profileName as string | undefined);

    let hasErrors = false;
    let hasWarnings = false;

    // 1. Check configuration directory exists
    console.log("📁 Checking configuration directory...");
    const configDirExists = await exists(profile.configDir);
    if (!configDirExists) {
      console.error(`  ❌ Configuration directory not found: ${profile.configDir}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ Configuration directory exists: ${profile.configDir}`);
    }

    // 2. Check main configuration file exists
    console.log("\n📄 Checking main configuration file...");
    const mainConfigPath = join(profile.configDir, profile.mainConfig);
    const mainConfigExists = await exists(mainConfigPath);
    if (!mainConfigExists) {
      console.error(`  ❌ Main configuration file not found: ${mainConfigPath}`);
      hasErrors = true;
    } else {
      console.log(`  ✅ Main configuration file exists: ${mainConfigPath}`);

      // 3. Syntax check based on format
      const format = profile.mainConfig.split(".").pop();
      console.log(`\n🔍 Checking ${format?.toUpperCase()} syntax...`);

      try {
        const content = await Deno.readTextFile(mainConfigPath);

        switch (format) {
          case "ts":
          case "js":
            // TypeScript/JavaScript basic checks (new template uses BaseConfig class)
            if (
              (content.includes("import") && content.includes("export")) ||
              content.includes("class Config extends BaseConfig")
            ) {
              console.log("  ✅ TypeScript/JavaScript module structure is valid");
            } else {
              console.warn("  ⚠️  TypeScript file may be missing proper structure");
              hasWarnings = true;
            }
            break;

          case "toml":
            // TOML syntax check
            try {
              parseToml(content);
              console.log("  ✅ TOML syntax is valid");
            } catch (e) {
              console.error(`  ❌ TOML syntax error: ${(e as Error).message}`);
              hasErrors = true;
            }
            break;

          case "lua":
            // Basic Lua syntax check (new template uses vim.fn["dpp#min#load_state"])
            if (
              content.includes("return {") || content.includes("return{") ||
              content.includes('vim.fn["dpp#min#load_state"]') ||
              content.includes('vim.fn["dpp#make_state"]')
            ) {
              console.log("  ✅ Lua syntax appears valid");
            } else {
              console.warn("  ⚠️  Lua file may be missing dpp setup");
              hasWarnings = true;
            }
            break;

          case "vim":
            // Vim script basic check (new template uses dpp#min#load_state)
            if (
              (content.includes("call dpp#begin") && content.includes("call dpp#end")) ||
              (content.includes("dpp#min#load_state") && content.includes("dpp#make_state"))
            ) {
              console.log("  ✅ Vim script structure is valid");
            } else {
              console.error("  ❌ Vim script missing dpp setup functions");
              hasErrors = true;
            }
            break;

          default:
            console.warn(`  ⚠️  Unknown format: ${format}`);
            hasWarnings = true;
        }
      } catch (e) {
        console.error(`  ❌ Failed to read configuration file: ${(e as Error).message}`);
        hasErrors = true;
      }
    }

    // 4. Check TOML files if present
    if (profile.tomlFiles.length > 0) {
      console.log("\n📋 Checking TOML files...");
      for (const tomlFile of profile.tomlFiles) {
        const tomlExists = await exists(tomlFile.path);
        if (!tomlExists) {
          console.error(`  ❌ TOML file not found: ${tomlFile.relativePath}`);
          hasErrors = true;
          continue;
        }

        try {
          const content = await Deno.readTextFile(tomlFile.path);
          const parsed = parseToml(content);

          // Check for plugins array
          if (!parsed.plugins || !Array.isArray(parsed.plugins)) {
            console.warn(`  ⚠️  ${tomlFile.relativePath}: No plugins array found`);
            hasWarnings = true;
          } else {
            console.log(`  ✅ ${tomlFile.relativePath}: ${parsed.plugins.length} plugins`);
          }
        } catch (e) {
          console.error(`  ❌ ${tomlFile.relativePath}: TOML syntax error - ${(e as Error).message}`);
          hasErrors = true;
        }
      }
    }

    // 5. Check editor compatibility
    console.log("\n🖥️  Checking editor compatibility...");
    if (targetEditor && targetEditor !== profile.editor) {
      console.warn(`  ⚠️  Profile configured for ${profile.editor}, but checking for ${targetEditor}`);
      hasWarnings = true;
    }

    // Check format compatibility
    const format = profile.mainConfig.split(".").pop();
    if (profile.editor === "vim" && format === "lua") {
      console.error("  ❌ Lua configuration is not compatible with Vim (Neovim only)");
      hasErrors = true;
    } else if (profile.editor === "nvim" && format === "vim") {
      console.warn("  ⚠️  Vim script works with Neovim, but TypeScript/Lua/TOML is recommended");
      hasWarnings = true;
    } else {
      console.log(`  ✅ Configuration format (${format}) is compatible with ${profile.editor}`);
    }

    // 6. Strict mode checks
    if (strict) {
      console.log("\n🔒 Running strict checks...");

      // Check for deprecated patterns
      try {
        const content = await Deno.readTextFile(mainConfigPath);
        
        if (content.includes("dein#") || content.includes("plug#")) {
          console.warn("  ⚠️  Detected patterns from other plugin managers (dein/vim-plug)");
          hasWarnings = true;
        }

        // Check for old template patterns
        if (format === "ts" && content.includes("satisfies Plugin[]") && !content.includes("BaseConfig")) {
          console.warn("  ⚠️  Using old TypeScript template. Consider regenerating with 'dpp init'");
          hasWarnings = true;
        }

        if ((format === "lua" || format === "vim") && content.includes("return {") && content.includes("plugins =")) {
          console.warn("  ⚠️  Using old Lua/Vim template. Consider regenerating with 'dpp init'");
          hasWarnings = true;
        }
      } catch {
        // Already handled above
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    if (hasErrors) {
      console.error("❌ Configuration check failed");
      console.error("\nPlease fix the errors above and run 'dpp check' again.");
      Deno.exit(1);
    } else if (hasWarnings) {
      console.log("⚠️  Configuration check passed with warnings");
      console.log("\nConsider addressing the warnings above.");
    } else {
      console.log("✅ Configuration is valid!");
      console.log("\nYour dpp.vim configuration looks good.");
    }
  },
});

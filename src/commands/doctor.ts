import { define } from "gunshi";
import { exists } from "@std/fs";
import { join } from "@std/path";
import { getProfile } from "../utils/global-config.ts";

export const doctorCommand = define({
  name: "doctor",
  description: "Diagnose environment and detect issues",
  args: {
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to check",
    },
  },
  run: async (ctx) => {
    const { profile: profileName } = ctx.values;

    console.log("🩺 Running dpp-cli diagnostics...\n");

    let issuesFound = 0;

    // 1. Check Deno installation
    console.log("1️⃣  Checking Deno installation...");
    try {
      const denoVersion = await runCommand(["deno", "--version"]);
      const versionMatch = denoVersion.match(/deno (\d+\.\d+\.\d+)/);
      if (versionMatch) {
        const version = versionMatch[1];
        console.log(`   ✅ Deno ${version} is installed`);
        
        // Check if version is >= 2.0.0
        const [major] = version.split(".").map(Number);
        if (major < 2) {
          console.warn(`   ⚠️  Deno 2.x is recommended (current: ${version})`);
          issuesFound++;
        }
      } else {
        console.log(`   ✅ Deno is installed`);
      }
    } catch {
      console.error("   ❌ Deno is not installed or not in PATH");
      console.error("      Install from: https://deno.land/");
      issuesFound++;
    }

    // 2. Check Vim/Neovim installation
    console.log("\n2️⃣  Checking Vim/Neovim installation...");
    
    const vimInstalled = await checkCommandExists("vim");
    const nvimInstalled = await checkCommandExists("nvim");
    
    if (nvimInstalled) {
      try {
        const nvimVersion = await runCommand(["nvim", "--version"]);
        const versionMatch = nvimVersion.match(/NVIM v(\d+\.\d+\.\d+)/);
        if (versionMatch) {
          console.log(`   ✅ Neovim ${versionMatch[1]} is installed`);
        } else {
          console.log(`   ✅ Neovim is installed`);
        }
      } catch {
        console.log(`   ✅ Neovim is installed`);
      }
    }
    
    if (vimInstalled) {
      try {
        const vimVersion = await runCommand(["vim", "--version"]);
        const versionMatch = vimVersion.match(/VIM - Vi IMproved (\d+\.\d+)/);
        if (versionMatch) {
          console.log(`   ✅ Vim ${versionMatch[1]} is installed`);
        } else {
          console.log(`   ✅ Vim is installed`);
        }
      } catch {
        console.log(`   ✅ Vim is installed`);
      }
    }
    
    if (!vimInstalled && !nvimInstalled) {
      console.error("   ❌ Neither Vim nor Neovim is installed");
      issuesFound++;
    }

    // 3. Check Git installation
    console.log("\n3️⃣  Checking Git installation...");
    try {
      const gitVersion = await runCommand(["git", "--version"]);
      const versionMatch = gitVersion.match(/git version (\d+\.\d+\.\d+)/);
      if (versionMatch) {
        console.log(`   ✅ Git ${versionMatch[1]} is installed`);
      } else {
        console.log(`   ✅ Git is installed`);
      }
    } catch {
      console.error("   ❌ Git is not installed or not in PATH");
      console.error("      Git is required for cloning plugins");
      issuesFound++;
    }

    // 4. Check dpp-cli configuration
    console.log("\n4️⃣  Checking dpp-cli configuration...");
    const profile = await getProfile(profileName);
    
    if (!profile) {
      console.error("   ❌ No profile found");
      console.error("      Run 'dpp init' to create a profile");
      issuesFound++;
    } else {
      console.log(`   ✅ Profile '${profile.name}' exists`);
      console.log(`      Config dir: ${profile.configDir}`);
      console.log(`      Editor: ${profile.editor}`);
      console.log(`      Main config: ${profile.mainConfig}`);

      // Check if config directory exists
      const configDirExists = await exists(profile.configDir);
      if (!configDirExists) {
        console.error(`   ❌ Configuration directory does not exist: ${profile.configDir}`);
        issuesFound++;
      }

      // Check if main config exists
      const mainConfigPath = join(profile.configDir, profile.mainConfig);
      const mainConfigExists = await exists(mainConfigPath);
      if (!mainConfigExists) {
        console.error(`   ❌ Main configuration file does not exist: ${mainConfigPath}`);
        issuesFound++;
      }
    }

    // 5. Check dpp.vim installation
    console.log("\n5️⃣  Checking dpp.vim installation...");
    const home = Deno.env.get("HOME") || "~";
    const xdgCacheHome = Deno.env.get("XDG_CACHE_HOME") || join(home, ".cache");
    const dppDir = join(xdgCacheHome, "dpp", "repos", "github.com", "Shougo", "dpp.vim");
    
    const dppExists = await exists(dppDir);
    if (dppExists) {
      console.log(`   ✅ dpp.vim is installed at ${dppDir}`);
      
      // Check for denops.vim
      const denopsDir = join(xdgCacheHome, "dpp", "repos", "github.com", "vim-denops", "denops.vim");
      const denopsExists = await exists(denopsDir);
      if (denopsExists) {
        console.log(`   ✅ denops.vim is installed`);
      } else {
        console.warn(`   ⚠️  denops.vim not found (required for dpp.vim)`);
        console.warn(`      It will be installed when you first run Vim/Neovim`);
        issuesFound++;
      }
    } else {
      console.warn(`   ⚠️  dpp.vim not found at ${dppDir}`);
      console.warn(`      It will be installed when you first run Vim/Neovim`);
    }

    // 6. Check XDG directories
    console.log("\n6️⃣  Checking XDG directories...");
    const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || join(home, ".config");
    console.log(`   XDG_CONFIG_HOME: ${xdgConfigHome}`);
    console.log(`   XDG_CACHE_HOME: ${xdgCacheHome}`);
    
    const configHomeExists = await exists(xdgConfigHome);
    const cacheHomeExists = await exists(xdgCacheHome);
    
    if (!configHomeExists) {
      console.warn(`   ⚠️  XDG_CONFIG_HOME directory does not exist`);
      issuesFound++;
    }
    
    if (!cacheHomeExists) {
      console.warn(`   ⚠️  XDG_CACHE_HOME directory does not exist`);
      issuesFound++;
    }

    // 7. Check network connectivity (optional)
    console.log("\n7️⃣  Checking network connectivity...");
    try {
      const response = await fetch("https://github.com", { method: "HEAD" });
      if (response.ok) {
        console.log(`   ✅ GitHub is accessible`);
      } else {
        console.warn(`   ⚠️  GitHub returned status ${response.status}`);
        issuesFound++;
      }
    } catch (error) {
      console.error(`   ❌ Cannot reach GitHub: ${(error as Error).message}`);
      console.error(`      Network connection is required for installing plugins`);
      issuesFound++;
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    if (issuesFound === 0) {
      console.log("✅ All checks passed!");
      console.log("\nYour environment is ready for dpp.vim.");
    } else {
      console.log(`⚠️  Found ${issuesFound} issue(s)`);
      console.log("\nPlease address the issues above to ensure proper functionality.");
    }

    console.log("\n📚 Documentation: https://github.com/Shougo/dpp.vim");
  },
});

async function runCommand(cmd: string[]): Promise<string> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout } = await command.output();
  if (code !== 0) {
    throw new Error(`Command failed: ${cmd.join(" ")}`);
  }

  return new TextDecoder().decode(stdout);
}

async function checkCommandExists(cmd: string): Promise<boolean> {
  try {
    const command = new Deno.Command("which", {
      args: [cmd],
      stdout: "null",
      stderr: "null",
    });

    const { code } = await command.output();
    return code === 0;
  } catch {
    return false;
  }
}

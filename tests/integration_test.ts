import { assertEquals, assertExists } from "@std/assert";
import { join } from "@std/path";
import { exists } from "@std/fs";

// Integration test for init command
Deno.test({
  name: "Integration: dpp init - minimal Lua template",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      // Set temporary XDG_CONFIG_HOME
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Run init command
      const command = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout, stderr } = await command.output();
      const output = new TextDecoder().decode(stdout);
      const errorOutput = new TextDecoder().decode(stderr);

      // Check command succeeded
      assertEquals(code, 0, `Command failed: ${errorOutput}`);

      // Check output messages
      assertEquals(
        output.includes("created successfully"),
        true,
        `Output doesn't contain "created successfully": ${output}`,
      );

      // Verify config file was created
      const configPath = join(tempDir, "nvim", "lua", "dpp_config.lua");
      const fileExists = await exists(configPath);
      assertEquals(fileExists, true, `Config file not found at: ${configPath}`);

      // Verify config file content
      const content = await Deno.readTextFile(configPath);
      assertEquals(
        content.includes("local dpp_base"),
        true,
        "Missing: local dpp_base",
      );
      assertEquals(
        content.includes("local dpp_config"),
        true,
        "Missing: local dpp_config",
      );
      assertEquals(
        content.includes('/dpp.ts"'),
        true,
        "Missing: /dpp.ts reference",
      );
      assertEquals(
        content.includes("dpp.make_state"),
        true,
        "Missing: dpp.make_state",
      );

      // Verify dpp.toml was created
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlExists = await exists(tomlPath);
      assertEquals(tomlExists, true);

      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes('repo = "Shougo/dpp.vim"'), true);
      assertEquals(
        tomlContent.includes('repo = "vim-denops/denops.vim"'),
        true,
      );

      // Verify profile was saved
      const profilePath = join(tempDir, "dpp-cli", "config.json");
      const profileExists = await exists(profilePath);
      assertEquals(profileExists, true);

      const profileContent = await Deno.readTextFile(profilePath);
      const profile = JSON.parse(profileContent);
      assertEquals(profile.version, "0.1.0");
      assertExists(profile.profiles.default);
      assertEquals(profile.profiles.default.editor, "nvim");
    } finally {
      // Restore environment
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }

      // Clean up
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for init with scaffold template
Deno.test({
  name: "Integration: dpp init - scaffold Lua template",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      const command = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "scaffold",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      // Verify scaffold template has more plugins
      const configPath = join(tempDir, "nvim", "lua", "dpp_config.lua");
      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("local dpp_base"), true);
      assertEquals(content.includes("local dpp_config"), true);
      assertEquals(content.includes("DenopsReady"), true); // scaffold has autocmd

      // Verify dpp.toml was created with scaffold plugins
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlExists = await exists(tomlPath);
      assertEquals(tomlExists, true);

      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes("dpp-ext-installer"), true);
      assertEquals(tomlContent.includes("dpp-protocol-git"), true);
    } finally {
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for add command
Deno.test({
  name: "Integration: dpp add - add plugin to config",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // First, initialize config
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const initResult = await initCommand.output();
      assertEquals(initResult.code, 0);

      // Add a plugin
      const addCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "add",
          "Shougo/ddu-ui-ff",
          "--onCmd",
          "Ddu",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout } = await addCommand.output();
      const output = new TextDecoder().decode(stdout);

      assertEquals(code, 0);
      assertEquals(output.includes("Added Shougo/ddu-ui-ff"), true);

      // Verify plugin was added to dpp.toml
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes("Shougo/ddu-ui-ff"), true);
      assertEquals(tomlContent.includes("on_cmd"), true);
    } finally {
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for remove command
Deno.test({
  name: "Integration: dpp remove - remove plugin from config",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize with scaffold (has more plugins)
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "scaffold",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      await initCommand.output();

      // Remove a plugin
      const removeCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "remove",
          "Shougo/ddu.vim",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout } = await removeCommand.output();
      const output = new TextDecoder().decode(stdout);

      assertEquals(code, 0);
      assertEquals(output.includes("Removed Shougo/ddu.vim"), true);

      // Verify plugin was removed from dpp.toml
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes("Shougo/ddu.vim"), false);
      // But other plugins should still be there
      assertEquals(tomlContent.includes("Shougo/ddc.vim"), true);
    } finally {
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for CLI help
Deno.test({
  name: "Integration: dpp --help shows usage",
  async fn() {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        join(Deno.cwd(), "main.ts"),
        "--help",
      ],
      cwd: Deno.cwd(),
    });

    const { code, stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    assertEquals(code, 0);
    assertEquals(output.includes("dpp"), true);
    assertEquals(output.includes("init"), true);
    assertEquals(output.includes("add"), true);
    assertEquals(output.includes("remove"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for no command
Deno.test({
  name: "Integration: dpp without command shows help",
  async fn() {
    const command = new Deno.Command(Deno.execPath(), {
      args: [
        "run",
        "--allow-read",
        "--allow-write",
        "--allow-env",
        join(Deno.cwd(), "main.ts"),
      ],
      cwd: Deno.cwd(),
    });

    const { code, stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    assertEquals(code, 0);
    assertEquals(output.includes("Dark powered plugin manager CLI"), true);
    assertEquals(output.includes("Commands:"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for Lua format is tested above
// TOML-only format is removed as nvim uses lua + toml, vim uses vim + toml

// Integration test for Vim script format
Deno.test({
  name: "Integration: dpp init - Vim script minimal",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      const command = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "minimal",
          "-e",
          "vim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      const configPath = join(tempDir, "vim", "autoload", "dpp.vim");
      const fileExists = await exists(configPath);
      assertEquals(fileExists, true);

      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("dpp#min#load_state("), true);
      assertEquals(content.includes("call dpp#make_state("), true);

      // Verify dpp.toml was created
      const tomlPath = join(tempDir, "vim", "dpp.toml");
      const tomlExists = await exists(tomlPath);
      assertEquals(tomlExists, true);

      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes('repo = "Shougo/dpp.vim"'), true);
    } finally {
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for add/remove with nvim
Deno.test({
  name: "Integration: dpp add/remove - TOML format",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize with nvim (creates lua + toml)
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      await initCommand.output();

      // Add a plugin
      const addCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "add",
          "Shougo/ddu-ui-ff",
        ],
        cwd: Deno.cwd(),
      });

      const { code: addCode } = await addCommand.output();
      assertEquals(addCode, 0);

      // Verify plugin was added
      const configPath = join(tempDir, "nvim", "dpp.toml");
      let content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("Shougo/ddu-ui-ff"), true);

      // Remove the plugin
      const removeCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "remove",
          "Shougo/ddu-ui-ff",
        ],
        cwd: Deno.cwd(),
      });

      const { code: removeCode } = await removeCommand.output();
      assertEquals(removeCode, 0);

      // Verify plugin was removed
      content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("Shougo/ddu-ui-ff"), false);
    } finally {
      if (originalXdgConfig) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// Integration test for clean command
Deno.test({
  name: "Integration: dpp clean - removes all files and profile",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");
    const originalXdgCache = Deno.env.get("XDG_CACHE_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);
      Deno.env.set("XDG_CACHE_HOME", tempDir);

      // 1. Run init to create files
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });
      const initResult = await initCommand.output();
      assertEquals(initResult.code, 0);

      // Verify files were created
      const nvimConfigDir = join(tempDir, "nvim");
      const mainConfig = join(nvimConfigDir, "lua", "dpp_config.lua");
      const tomlConfig = join(nvimConfigDir, "dpp.toml");
      const tsConfig = join(nvimConfigDir, "dpp.ts");
      const cacheDir = join(tempDir, "dpp");

      assertEquals(await exists(mainConfig), true);
      assertEquals(await exists(tomlConfig), true);
      assertEquals(await exists(tsConfig), true);
      assertEquals(await exists(cacheDir), true);

      // 2. Run clean with --force
      const cleanCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "clean",
          "--force",
        ],
        cwd: Deno.cwd(),
      });
      const cleanResult = await cleanCommand.output();
      assertEquals(cleanResult.code, 0);

      // 3. Verify files were deleted
      assertEquals(await exists(mainConfig), false);
      assertEquals(await exists(tomlConfig), false);
      assertEquals(await exists(tsConfig), false);
      assertEquals(await exists(cacheDir), false);

      // 4. Verify profile was deleted (global config should not exist if last profile)
      const globalConfigPath = join(tempDir, "dpp-cli", "config.json");
      const globalConfigExists = await exists(globalConfigPath);
      // Should be deleted if it was the last profile
      assertEquals(globalConfigExists, false);
    } finally {
      if (originalXdgConfig !== undefined) {
        Deno.env.set("XDG_CONFIG_HOME", originalXdgConfig);
      } else {
        Deno.env.delete("XDG_CONFIG_HOME");
      }
      if (originalXdgCache !== undefined) {
        Deno.env.set("XDG_CACHE_HOME", originalXdgCache);
      } else {
        Deno.env.delete("XDG_CACHE_HOME");
      }
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

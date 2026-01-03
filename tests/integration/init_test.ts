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

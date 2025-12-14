import { assertEquals, assertExists } from "@std/assert";
import { join } from "@std/path";
import { exists } from "@std/fs";

// Integration test for init command
Deno.test({
  name: "Integration: dpp init - minimal TypeScript template",
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "ts",
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
      assertEquals(output.includes("created successfully"), true, `Output doesn't contain "created successfully": ${output}`);

      // Verify config file was created
      const configPath = join(tempDir, "nvim", "dpp.ts");
      const fileExists = await exists(configPath);
      assertEquals(fileExists, true);

      // Verify config file content
      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes('export class Config extends BaseConfig'), true);
      assertEquals(content.includes('override async config('), true);
      assertEquals(content.includes('dpp-ext-toml'), true);
      
      // Verify dpp.toml was created
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlExists = await exists(tomlPath);
      assertEquals(tomlExists, true);
      
      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes('repo = "Shougo/dpp.vim"'), true);
      assertEquals(tomlContent.includes('repo = "vim-denops/denops.vim"'), true);

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
  name: "Integration: dpp init - scaffold TypeScript template",
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "ts",
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
      const configPath = join(tempDir, "nvim", "dpp.ts");
      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("export class Config extends BaseConfig"), true);
      assertEquals(content.includes("dpp-ext-lazy"), true);
      assertEquals(content.includes("dpp-ext-toml"), true);
      
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "ts",
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
      assertEquals(tomlContent.includes('on_cmd'), true);
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "ts",
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

// Integration test for update command
Deno.test({
  name: "Integration: dpp update - shows instructions",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize config
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          join(Deno.cwd(), "main.ts"),
          "init",
        ],
        cwd: Deno.cwd(),
      });

      await initCommand.output();

      // Run update command
      const updateCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          join(Deno.cwd(), "main.ts"),
          "update",
          "--all",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout } = await updateCommand.output();
      const output = new TextDecoder().decode(stdout);

      assertEquals(code, 0);
      assertEquals(output.includes("Plugin updates are managed by dpp.vim"), true);
      assertEquals(output.includes("dpp#async_ext_action"), true);
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
    assertEquals(output.includes("update"), true);
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

// Integration test for TOML format
Deno.test({
  name: "Integration: dpp init - TOML minimal",
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "toml",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      // Verify TOML config file was created
      const configPath = join(tempDir, "nvim", "dpp.toml");
      const fileExists = await exists(configPath);
      assertEquals(fileExists, true);

      // Verify TOML content
      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes('repo = "Shougo/dpp.vim"'), true);
      assertEquals(content.includes('repo = "vim-denops/denops.vim"'), true);
      assertEquals(content.includes("[[plugins]]"), true);
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

// Integration test for TOML scaffold
Deno.test({
  name: "Integration: dpp init - TOML scaffold",
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "toml",
          "-t",
          "scaffold",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      const configPath = join(tempDir, "nvim", "dpp.toml");
      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes("dpp-ext-installer"), true);
      assertEquals(content.includes("dpp-ext-lazy"), true);
      assertEquals(content.includes("ddu.vim"), true);
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

// Integration test for Lua format
Deno.test({
  name: "Integration: dpp init - Lua minimal",
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "lua",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      const configPath = join(tempDir, "nvim", "dpp.lua");
      const fileExists = await exists(configPath);
      assertEquals(fileExists, true);

      const content = await Deno.readTextFile(configPath);
      assertEquals(content.includes('vim.fn["dpp#min#load_state"]'), true);
      assertEquals(content.includes('vim.fn["dpp#make_state"]'), true);
      
      // Verify dpp.toml was created
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
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
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "vim",
          "-t",
          "minimal",
          "-e",
          "vim",
        ],
        cwd: Deno.cwd(),
      });

      const { code } = await command.output();
      assertEquals(code, 0);

      const configPath = join(tempDir, "vim", "dpp.vim");
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

// Integration test for TOML add/remove
Deno.test({
  name: "Integration: dpp add/remove - TOML format",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize with TOML
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "toml",
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

// Integration test for check command
Deno.test({
  name: "Integration: dpp check - valid configuration",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize first
      const initCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          join(Deno.cwd(), "main.ts"),
          "init",
          "-f",
          "ts",
          "-t",
          "minimal",
          "-e",
          "nvim",
        ],
        cwd: Deno.cwd(),
      });

      await initCommand.output();

      // Run check command
      const checkCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-net",
          join(Deno.cwd(), "main.ts"),
          "check",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout, stderr } = await checkCommand.output();
      const output = new TextDecoder().decode(stdout);
      const errorOutput = new TextDecoder().decode(stderr);

      if (code !== 0) {
        console.log("STDOUT:", output);
        console.log("STDERR:", errorOutput);
      }

      assertEquals(code, 0);
      assertEquals(output.includes("Configuration is valid") || output.includes("Configuration check passed"), true);
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

// Integration test for doctor command
Deno.test({
  name: "Integration: dpp doctor - environment check",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Run doctor command
      const doctorCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-net",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "doctor",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout } = await doctorCommand.output();
      const output = new TextDecoder().decode(stdout);

      // Doctor should run successfully even if no profile exists
      assertEquals(code, 0);
      assertEquals(output.includes("Running dpp-cli diagnostics"), true);
      assertEquals(output.includes("Checking Deno installation"), true);
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


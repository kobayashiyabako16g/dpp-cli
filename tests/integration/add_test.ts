import { assertEquals } from "@std/assert";
import { join } from "@std/path";

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
          "scaffold",
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
          "scaffold",
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

// Integration test to verify add command is blocked for minimal template
Deno.test({
  name: "Integration: dpp add - blocked for minimal template",
  async fn() {
    const tempDir = await Deno.makeTempDir();
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Initialize with minimal template
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

      // Try to add a plugin - should fail
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

      const { code, stderr } = await addCommand.output();
      const errorOutput = new TextDecoder().decode(stderr);

      // Should exit with error code 1
      assertEquals(code, 1);
      // Error message should mention minimal template restriction
      assertEquals(
        errorOutput.includes("not available for minimal template"),
        true,
      );
      assertEquals(errorOutput.includes("dpp init --template scaffold"), true);
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

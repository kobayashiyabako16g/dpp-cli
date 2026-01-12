import { assertEquals } from "@std/assert";
import { join } from "@std/path";

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

      // Remove a plugin (using dpp-ext-installer which exists in scaffold)
      const removeCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "remove",
          "Shougo/dpp-ext-installer",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stdout } = await removeCommand.output();
      const output = new TextDecoder().decode(stdout);

      assertEquals(code, 0);
      assertEquals(output.includes("Removed Shougo/dpp-ext-installer"), true);

      // Verify plugin was removed from dpp.toml
      const tomlPath = join(tempDir, "nvim", "dpp.toml");
      const tomlContent = await Deno.readTextFile(tomlPath);
      assertEquals(tomlContent.includes("Shougo/dpp-ext-installer"), false);
      // But other plugins should still be there
      assertEquals(tomlContent.includes("Shougo/dpp-ext-lazy"), true);
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

// Integration test to verify remove command is blocked for minimal template
Deno.test({
  name: "Integration: dpp remove - blocked for minimal template",
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

      // Try to remove a plugin - should fail
      const removeCommand = new Deno.Command(Deno.execPath(), {
        args: [
          "run",
          "--allow-read",
          "--allow-write",
          "--allow-env",
          "--allow-run",
          join(Deno.cwd(), "main.ts"),
          "remove",
          "Shougo/dpp.vim",
        ],
        cwd: Deno.cwd(),
      });

      const { code, stderr } = await removeCommand.output();
      const errorOutput = new TextDecoder().decode(stderr);

      // Should exit with error code 1
      assertEquals(code, 1);
      // Error message should mention minimal template restriction
      assertEquals(errorOutput.includes("not available for minimal template"), true);
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

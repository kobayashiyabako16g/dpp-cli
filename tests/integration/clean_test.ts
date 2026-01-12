import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { exists } from "@std/fs";

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
      const tsConfig = join(nvimConfigDir, "dpp.ts");
      const cacheDir = join(tempDir, "dpp");

      assertEquals(await exists(mainConfig), true);
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

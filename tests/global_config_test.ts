import { assertEquals, assertExists } from "@std/assert";
import { join } from "@std/path";
import {
  getGlobalConfigPath,
  loadGlobalConfig,
  saveProfile,
} from "../src/utils/global-config.ts";
import { createDefaultProfile } from "../src/types/config.ts";

Deno.test("getGlobalConfigPath", () => {
  const path = getGlobalConfigPath();

  assertExists(path);
  assertEquals(path.includes("dpp-cli/config.json"), true);
});

Deno.test("loadGlobalConfig - creates default when not exists", async () => {
  const config = await loadGlobalConfig();

  assertExists(config);
  assertEquals(config.version, "0.1.0");
  assertExists(config.profiles);
});

Deno.test({
  name: "saveProfile and loadGlobalConfig - integration",
  async fn() {
    // Create a temporary config directory
    const tempDir = await Deno.makeTempDir();
    const originalHome = Deno.env.get("HOME");
    const originalXdgConfig = Deno.env.get("XDG_CONFIG_HOME");

    try {
      // Set temporary HOME
      Deno.env.set("XDG_CONFIG_HOME", tempDir);

      // Create and save a profile
      const profile = createDefaultProfile("nvim");
      profile.name = "test-profile";
      profile.configDir = join(tempDir, "nvim");

      await saveProfile(profile);

      // Load and verify
      const config = await loadGlobalConfig();
      assertExists(config.profiles["test-profile"]);
      assertEquals(config.profiles["test-profile"].name, "test-profile");
      assertEquals(config.profiles["test-profile"].editor, "nvim");
      assertEquals(config.activeProfile, "test-profile"); // First profile becomes active
    } finally {
      // Restore environment
      if (originalHome) {
        Deno.env.set("HOME", originalHome);
      }
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

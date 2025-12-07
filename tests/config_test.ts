import { assertEquals, assertExists } from "@std/assert";
import {
  createDefaultGlobalConfig,
  createDefaultProfile,
} from "../src/types/config.ts";

Deno.test("createDefaultGlobalConfig", () => {
  const config = createDefaultGlobalConfig();

  assertEquals(config.version, "0.1.0");
  assertEquals(config.activeProfile, "default");
  assertExists(config.profiles);
  assertEquals(Object.keys(config.profiles).length, 0);
});

Deno.test("createDefaultProfile - nvim", () => {
  const profile = createDefaultProfile("nvim");

  assertEquals(profile.name, "default");
  assertEquals(profile.editor, "nvim");
  assertEquals(profile.mainConfig, "dpp.ts");
  assertEquals(profile.tomlFiles.length, 0);
  assertEquals(profile.configDir.endsWith("/nvim"), true);
  assertExists(profile.lastModified);
});

Deno.test("createDefaultProfile - vim", () => {
  const profile = createDefaultProfile("vim");

  assertEquals(profile.name, "default");
  assertEquals(profile.editor, "vim");
  assertEquals(profile.mainConfig, "dpp.ts");
  assertEquals(profile.configDir.endsWith("/vim"), true);
});

import { assertEquals, assertExists } from "@std/assert";
import { resolveDppPaths } from "../src/utils/paths.ts";

Deno.test("resolveDppPaths - default nvim paths", () => {
  const paths = resolveDppPaths({ editor: "nvim" });

  assertExists(paths.configDir);
  assertExists(paths.configFile);
  assertExists(paths.cacheDir);
  assertExists(paths.pluginsDir);

  assertEquals(paths.configFile.endsWith("/nvim/dpp.ts"), true);
  assertEquals(paths.cacheDir.endsWith("/dpp"), true);
  assertEquals(paths.pluginsDir.endsWith("/dpp/repos/github.com"), true);
});

Deno.test("resolveDppPaths - custom format", () => {
  const paths = resolveDppPaths({ editor: "nvim", format: "toml" });

  assertEquals(paths.configFile.endsWith("/nvim/dpp.toml"), true);
});

Deno.test("resolveDppPaths - vim editor", () => {
  const paths = resolveDppPaths({ editor: "vim" });

  assertEquals(paths.configFile.endsWith("/vim/dpp.ts"), true);
});

Deno.test("resolveDppPaths - custom config dir", () => {
  const customDir = "/custom/path";
  const paths = resolveDppPaths({ configDir: customDir, editor: "nvim" });

  assertEquals(paths.configDir, customDir);
  assertEquals(paths.configFile, `${customDir}/dpp.ts`);
});

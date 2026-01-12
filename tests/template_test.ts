import { assertEquals } from "@std/assert";
import { generateTemplate } from "../src/templates/generator.ts";
import type { TemplateContext } from "../src/types/template.ts";
import { resolveDppPaths } from "../src/utils/paths.ts";

Deno.test("generateTemplate - TypeScript minimal", async () => {
  const context: TemplateContext = {
    editor: "nvim",
    type: "minimal",
    format: "ts",
    paths: resolveDppPaths({ editor: "nvim" }),
  };

  const result = await generateTemplate(context);

  // Check for BaseConfig class pattern
  assertEquals(result.includes("export class Config extends BaseConfig"), true);
  assertEquals(result.includes("override async config("), true);
  assertEquals(result.includes("ConfigReturn"), true);
  // Minimal template does NOT use dpp-ext-toml (static plugin list)
  assertEquals(result.includes("dpp-ext-toml"), false);
  // Check for inline plugin definitions instead
  assertEquals(result.includes("const plugins: Plugin[]"), true);
  // Should have hardcoded plugins
  assertEquals(result.includes("denops.vim"), true);
  assertEquals(result.includes("dpp.vim"), true);
});

Deno.test("generateTemplate - TypeScript scaffold", async () => {
  const context: TemplateContext = {
    editor: "nvim",
    type: "scaffold",
    format: "ts",
    paths: resolveDppPaths({ editor: "nvim" }),
  };

  const result = await generateTemplate(context);

  // Check for BaseConfig class pattern
  assertEquals(result.includes("export class Config extends BaseConfig"), true);
  assertEquals(result.includes("override async config("), true);
  // Check for TOML extension
  assertEquals(result.includes("dpp-ext-toml"), true);
  // Check for lazy extension
  assertEquals(result.includes("dpp-ext-lazy"), true);
  // Check for hooks and makeState
  assertEquals(result.includes("MultipleHook"), true);
  assertEquals(result.includes("lazyExt.actions.makeState"), true);
});

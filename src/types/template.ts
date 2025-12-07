import type { DppPaths } from "../utils/paths.ts";

export interface TemplateContext {
  editor: "vim" | "nvim";
  type: "minimal" | "scaffold";
  format: "ts" | "toml" | "lua" | "vim";
  paths: DppPaths;
  generatedAt?: string;
  userName?: string;
}

export type TemplateGenerator = (context: TemplateContext) => string;

export interface TemplateGenerators {
  ts: {
    minimal: TemplateGenerator;
    scaffold: TemplateGenerator;
  };
  toml: {
    minimal: TemplateGenerator;
    scaffold: TemplateGenerator;
  };
  lua: {
    minimal: TemplateGenerator;
    scaffold: TemplateGenerator;
  };
  vim: {
    minimal: TemplateGenerator;
    scaffold: TemplateGenerator;
  };
}

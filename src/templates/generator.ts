import type { TemplateContext } from "../types/template.ts";
import { Eta } from "eta";
import { dirname, fromFileUrl, join } from "@std/path";

const eta = new Eta();

// Get the directory of this module
const moduleDir = dirname(fromFileUrl(import.meta.url));

async function loadTemplate(format: string, type: string): Promise<string> {
  const templatePath = join(moduleDir, type, `${format}.eta`);
  return await Deno.readTextFile(templatePath);
}

export async function generateTemplate(
  context: TemplateContext,
): Promise<string> {
  try {
    const template = await loadTemplate(context.format, context.type);
    return eta.renderString(template, context);
  } catch (error) {
    throw new Error(
      `Template not found for format: ${context.format}, type: ${context.type}. Error: ${error}`,
    );
  }
}

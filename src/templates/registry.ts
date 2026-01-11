import type { TemplateHandler } from "../types/template.ts";
import { MinimalHandler } from "./minimal/handler.ts";
import { ScaffoldHandler } from "./scaffold/handler.ts";

const handlers: Record<string, TemplateHandler> = {
  minimal: new MinimalHandler(),
  scaffold: new ScaffoldHandler(),
};

export function getTemplateHandler(type: string): TemplateHandler {
  const handler = handlers[type];
  if (!handler) {
    throw new Error(`Unknown template type: ${type}`);
  }
  return handler;
}

import { parse, stringify } from "@std/toml";
import type { Plugin } from "@shougo/dpp-vim/types";

export interface TomlConfig {
  plugins: Plugin[];
}

export async function readTomlConfig(path: string): Promise<TomlConfig> {
  const content = await Deno.readTextFile(path);
  const parsed = parse(content);
  return parsed as unknown as TomlConfig;
}

export async function writeTomlConfig(
  path: string,
  config: TomlConfig,
): Promise<void> {
  const content = stringify(config as unknown as Record<string, unknown>);
  await Deno.writeTextFile(path, content);
}

export async function addPluginToToml(
  path: string,
  plugin: Partial<Plugin> & { repo: string },
): Promise<void> {
  const config = await readTomlConfig(path);
  config.plugins.push(plugin as Plugin);
  await writeTomlConfig(path, config);
}

export async function removePluginFromToml(
  path: string,
  repo: string,
): Promise<boolean> {
  const config = await readTomlConfig(path);
  const initialLength = config.plugins.length;
  config.plugins = config.plugins.filter((p) => p.repo !== repo);

  if (config.plugins.length === initialLength) {
    return false; // Plugin not found
  }

  await writeTomlConfig(path, config);
  return true;
}

import type { Plugin } from "@shougo/dpp-vim/types";
import { logger } from "./logger.ts";
import {
  addPluginToToml,
  readTomlConfig,
  removePluginFromToml,
} from "./toml-config.ts";

/**
 * Configuration handler interface
 */
export interface ConfigHandler {
  /**
   * Add a plugin to the configuration
   */
  addPlugin(
    path: string,
    plugin: Partial<Plugin> & { repo: string },
  ): Promise<void>;

  /**
   * Remove a plugin from the configuration
   */
  removePlugin(path: string, repo: string): Promise<boolean>;

  /**
   * Validate configuration file
   */
  validate(path: string): Promise<{ valid: boolean; errors: string[] }>;
}

/**
 * TOML configuration handler
 */
export class TomlConfigHandler implements ConfigHandler {
  async addPlugin(
    path: string,
    plugin: Partial<Plugin> & { repo: string },
  ): Promise<void> {
    await addPluginToToml(path, plugin);
  }

  async removePlugin(path: string, repo: string): Promise<boolean> {
    return await removePluginFromToml(path, repo);
  }

  async validate(path: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      const config = await readTomlConfig(path);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        errors.push("TOML file missing 'plugins' array");
      }
    } catch (error) {
      errors.push(`TOML parsing error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Get appropriate config handler based on format
 * All formats use TOML for plugin management
 */
export function getConfigHandler(): ConfigHandler {
  return new TomlConfigHandler();
}

/**
 * Get TOML path from profile
 */
export function getTomlPath(profile: {
  defaultToml?: string;
  configDir: string;
}): string {
  if (profile.defaultToml) {
    return profile.defaultToml;
  }

  // Fallback to dpp.toml in config directory
  return `${profile.configDir}/dpp.toml`;
}

/**
 * Notify user about TOML-based plugin management for non-TOML formats
 */
export function notifyTomlUsage(format: string): void {
  if (format !== "toml") {
    logger.info(
      `Note: Plugins are managed in dpp.toml file for ${format} configuration.`,
    );
  }
}

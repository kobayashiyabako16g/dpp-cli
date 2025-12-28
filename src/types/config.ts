// Use official type definitions from dpp.vim
import type {
  DppOptions,
  ExtOptions,
  Plugin,
  ProtocolName,
  ProtocolOptions,
} from "@shougo/dpp-vim/types";

// Configuration types for CLI
export interface Config {
  plugins: Plugin[];
  protocols?: ProtocolName[];
  extOptions?: Record<string, Partial<ExtOptions>>;
  extParams?: Record<string, Record<string, unknown>>;
  protocolOptions?: Record<ProtocolName, Partial<ProtocolOptions>>;
  protocolParams?: Record<ProtocolName, Record<string, unknown>>;
}

// Global configuration file: XDG_CONFIG_HOME/dpp-cli/config.json
export interface GlobalConfig {
  version: string;
  profiles: Record<string, Profile>;
  activeProfile: string;
}

export interface Profile {
  name: string;
  configDir: string; // ~/.config/nvim
  editor: "vim" | "nvim";
  mainConfig: string; // dpp.ts or dpp.vim
  tomlFiles: TomlFileEntry[]; // List of TOML files in use
  defaultToml?: string; // Default TOML for add command
  lastModified: string;
}

export interface TomlFileEntry {
  path: string; // ~/.config/nvim/dpp.toml
  description?: string; // "Core plugins", "LSP plugins" etc.
  relativePath: string; // dpp.toml or plugins/lsp.toml
}

// Default configuration
export function createDefaultGlobalConfig(): GlobalConfig {
  return {
    version: "0.1.0",
    profiles: {},
    activeProfile: "default",
  };
}

export function createDefaultProfile(editor: "vim" | "nvim"): Profile {
  const home = Deno.env.get("HOME") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") ||
    `${home}/.config`;
  const configDir = `${xdgConfigHome}/${editor}`;

  return {
    name: "default",
    configDir,
    editor,
    mainConfig: "dpp.ts",
    tomlFiles: [],
    lastModified: new Date().toISOString(),
  };
}

// Export types from dpp.vim
export type { DppOptions, ExtOptions, Plugin, ProtocolName, ProtocolOptions };

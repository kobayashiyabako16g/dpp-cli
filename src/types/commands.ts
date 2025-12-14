import type { CommandContext as GunshiContext } from "gunshi";

// Extend gunshi's CommandContext
export type CommandContext = GunshiContext;

// Types for each command's values
export interface InitCommandValues {
  path?: string;
  template: "minimal" | "scaffold";
  editor: "vim" | "nvim";
  profile?: string; // Profile name
}

export interface AddCommandValues {
  repo: string;
  toml?: string; // Target TOML file (relative path)
  onCmd?: string;
  onFt?: string;
  onEvent?: string;
  depends?: string;
  frozen?: boolean;
  branch?: string;
  profile?: string; // Profile name
}

export interface RemoveCommandValues {
  repo: string;
  toml?: string; // Target TOML file (relative path)
  profile?: string; // Profile name
}

export interface UpdateCommandValues {
  repos?: string[];
  all?: boolean;
  parallel?: number;
  dryRun?: boolean;
  profile?: string; // Profile name
}

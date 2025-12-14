import type { CommandContext as GunshiContext } from "gunshi";

// gunshiのCommandContextを拡張
export type CommandContext = GunshiContext;

// 各コマンドの値の型
export interface InitCommandValues {
  path?: string;
  template: "minimal" | "scaffold";
  editor: "vim" | "nvim";
  profile?: string; // プロファイル名
}

export interface AddCommandValues {
  repo: string;
  toml?: string; // 対象TOMLファイル（相対パス）
  onCmd?: string;
  onFt?: string;
  onEvent?: string;
  depends?: string;
  frozen?: boolean;
  branch?: string;
  profile?: string; // プロファイル名
}

export interface RemoveCommandValues {
  repo: string;
  toml?: string; // 対象TOMLファイル（相対パス）
  profile?: string; // プロファイル名
}

export interface UpdateCommandValues {
  repos?: string[];
  all?: boolean;
  parallel?: number;
  dryRun?: boolean;
  profile?: string; // プロファイル名
}

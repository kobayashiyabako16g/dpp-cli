# dpp.vim CLI 設計ドキュメント

## 概要

dpp.vimのプラグイン管理を効率化するCLIツール。sheldonの設計思想を参考にしつつ、Denoを活用した型安全な設定管理を実現する。

## 設計目標

- **型安全性**: dpp.vimの型情報を活用した設定の妥当性保証
- **使いやすさ**: 直感的なコマンド体系とわかりやすいエラーメッセージ
- **柔軟性**: vim/neovim、複数の設定形式、テンプレートの選択肢
- **パフォーマンス**: Denoの並列処理による高速な操作
- **互換性**: 既存のdpp.vim設定との互換性維持

## アーキテクチャ

### 技術スタック

- **ランタイム**: Deno 2.x
- **CLI フレームワーク**: gunshi
- **設定形式**: TypeScript / TOML / JSON
- **型定義**: dpp.vimの公式型定義

### ディレクトリ構造

```
# 設定ファイル（XDG_CONFIG_HOME/nvim または XDG_CONFIG_HOME/vim）
~/.config/nvim/
├── dpp.ts              # TypeScript設定（推奨）
├── dpp.toml            # TOML設定（代替）
└── dpp.lua             # Lua設定（Neovim）

~/.config/vim/
└── dpp.vim             # Vim script設定（Vim）

# プラグインキャッシュ（dpp.vimが管理）
~/.cache/dpp/
└── repos/
    └── github.com/
        └── Shougo/
            └── dpp.vim/
```

### プロジェクト構造

```
dpp-cli/
├── main.ts                    # CLIエントリーポイント
├── deno.json                  # Deno設定
├── src/
│   ├── cli.ts                # CLIメイン設定（gunshi）
│   ├── commands/
│   │   ├── init.ts           # 初期化コマンド定義
│   │   ├── add.ts            # プラグイン追加コマンド定義
│   │   ├── remove.ts         # プラグイン削除コマンド定義
│   │   ├── update.ts         # プラグイン更新コマンド定義
│   │   ├── source.ts         # 設定出力コマンド定義
│   │   ├── check.ts          # 設定検証コマンド定義
│   │   ├── migrate.ts        # 移行ツールコマンド定義
│   │   └── doctor.ts         # 環境診断コマンド定義
│   ├── config/
│   │   ├── loader.ts         # 設定ファイル読み込み
│   │   ├── parser.ts         # 設定パース
│   │   └── validator.ts      # 設定検証
│   ├── templates/
│   │   ├── generator.ts      # テンプレート生成メイン
│   │   ├── minimal/
│   │   │   ├── typescript.ts # TS minimal生成関数
│   │   │   ├── toml.ts       # TOML minimal生成関数
│   │   │   ├── lua.ts        # Lua minimal生成関数
│   │   │   └── vim.ts        # Vim minimal生成関数
│   │   └── scaffold/
│   │       ├── typescript.ts # TS scaffold生成関数
│   │       ├── toml.ts       # TOML scaffold生成関数
│   │       ├── lua.ts        # Lua scaffold生成関数
│   │       └── vim.ts        # Vim scaffold生成関数
│   ├── plugins/
│   │   ├── manager.ts        # プラグイン管理
│   │   ├── resolver.ts       # 依存関係解決
│   │   └── installer.ts      # インストール処理
│   ├── types/
│   │   ├── config.ts         # 設定の型定義
│   │   ├── commands.ts       # コマンドの型定義
│   │   └── template.ts       # テンプレートの型定義
│   └── utils/
│       ├── logger.ts         # ロギング
│       ├── git.ts            # Git操作
│       ├── fs.ts             # ファイルシステム操作
│       └── paths.ts          # パス解決（XDG対応）
└── tests/
    └── ...
```

## CLI構造（gunshiベース）

### メインコマンド

```typescript
// main.ts
import { cli } from "@gunshi/gunshi";
import { mainCommand } from "./src/cli.ts";

await cli(Deno.args, mainCommand, {
  name: "dpp",
  version: "0.1.0",
});
```

### コマンド定義の例

```typescript
// src/cli.ts
import { define } from "@gunshi/gunshi";
import { initCommand } from "./commands/init.ts";
import { addCommand } from "./commands/add.ts";
import { removeCommand } from "./commands/remove.ts";
// ... 他のコマンドのインポート

export const mainCommand = define({
  name: "dpp",
  description: "Dark powered plugin manager CLI",
  run: (ctx) => {
    console.log("Run 'dpp --help' for usage information");
  },
});

export const subCommands = {
  init: initCommand,
  add: addCommand,
  remove: removeCommand,
  update: updateCommand,
  source: sourceCommand,
  check: checkCommand,
  migrate: migrateCommand,
  doctor: doctorCommand,
};
```

## コマンド仕様

### 1. `dpp init`

新しいdpp.vim設定を初期化する。

```bash
dpp init [options]
```

**コマンド定義:**
```typescript
// src/commands/init.ts
import { define } from "@gunshi/gunshi";
import type { CommandContext } from "../types/commands.ts";

export const initCommand = define({
  name: "init",
  description: "Initialize dpp.vim configuration",
  args: {
    format: {
      type: "string",
      short: "f",
      description: "Configuration file format",
      default: "ts",
    },
    path: {
      type: "string",
      short: "p",
      description: "Configuration file path",
    },
    template: {
      type: "string",
      short: "t",
      description: "Template to use (minimal or scaffold)",
      default: "minimal",
    },
    editor: {
      type: "string",
      short: "e",
      description: "Target editor (vim or nvim)",
      default: "nvim",
    },
  },
  run: async (ctx) => {
    const { format, path, template, editor, profile: profileName } = ctx.values;
    
    // 実装ロジック
    // 1. 設定ディレクトリの作成
    // 2. 初期設定ファイルの生成
    // 3. 必要なディレクトリ構造の作成
    
    // 4. プロファイルを作成・保存
    const profile = createDefaultProfile(editor);
    profile.name = profileName || "default";
    profile.mainConfig = `dpp.${format}`;
    
    if (path) {
      profile.configDir = path;
    }
    
    // TOMLファイルを検出
    const tomlFiles = await detectAndAddTomlFiles(profile);
    profile.tomlFiles = tomlFiles;
    
    // 最初のTOMLをデフォルトに設定
    if (tomlFiles.length > 0) {
      profile.defaultToml = tomlFiles[0].path;
    }
    
    await saveProfile(profile);
    
    console.log(`Profile '${profile.name}' created successfully`);
    console.log(`Config directory: ${profile.configDir}`);
    console.log(`Main config: ${profile.mainConfig}`);
    if (tomlFiles.length > 0) {
      console.log(`TOML files detected: ${tomlFiles.map(f => f.relativePath).join(", ")}`);
    }
  },
});
```

**オプション:**
- `--format, -f <ts|toml|lua|vim>`: 設定ファイルの形式（デフォルト: ts）
- `--path, -p <path>`: 設定ファイルのパス（デフォルト: XDG_CONFIG_HOME/nvim または XDG_CONFIG_HOME/vim）
- `--template, -t <minimal|scaffold>`: テンプレートの使用（デフォルト: minimal）
- `--editor, -e <vim|nvim>`: 対象エディタ（デフォルト: nvim）

**動作:**
1. 設定ディレクトリの作成
2. 初期設定ファイルの生成
3. 必要なディレクトリ構造の作成

### 2. `dpp add`

プラグインを追加する。

```bash
dpp add <repo> [options]
```

**コマンド定義:**
```typescript
// src/commands/add.ts
import { define } from "@gunshi/gunshi";
import { getProfile, getTargetToml, saveProfile, detectAndAddTomlFiles } from "../utils/global-config.ts";

export const addCommand = define({
  name: "add",
  description: "Add a plugin to dpp.vim configuration",
  args: {
    repo: {
      type: "positional",
      description: "Plugin repository (e.g., Shougo/ddu.vim)",
      required: true,
    },
    toml: {
      type: "string",
      short: "t",
      description: "Target TOML file (relative to config dir)",
    },
    onCmd: {
      type: "string",
      description: "Command lazy loading",
    },
    onFt: {
      type: "string",
      description: "Filetype lazy loading",
    },
    onEvent: {
      type: "string",
      description: "Event lazy loading",
    },
    depends: {
      type: "string",
      description: "Plugin dependencies (comma-separated)",
    },
    frozen: {
      type: "boolean",
      description: "Freeze plugin version",
    },
    branch: {
      type: "string",
      short: "b",
      description: "Specify branch",
    },
    profile: {
      type: "string",
      short: "p",
      description: "Profile name to use",
    },
  },
  run: async (ctx) => {
    const { repo, toml, onCmd, onFt, onEvent, depends, frozen, branch, profile: profileName } = ctx.values;
    
    // プロファイルを取得
    const profile = await getProfile(profileName);
    if (!profile) {
      throw new Error("No profile found. Run 'dpp init' first.");
    }
    
    // 対象TOMLファイルを決定
    const targetToml = await getTargetToml(toml, profile);
    
    console.log(`Adding ${repo} to ${targetToml}...`);
    
    // 実装ロジック
    // 1. TOMLファイルを読み込んでプラグインを追加
    // 2. TOMLファイルを保存
    // 3. プロファイルを更新（TOMLファイルリストに追加）
    
    // TOMLファイルリストを再検出して更新
    const tomlFiles = await detectAndAddTomlFiles(profile);
    profile.tomlFiles = tomlFiles;
    await saveProfile(profile);
  },
});
```

**使用例:**
```bash
# デフォルトTOMLに追加
dpp add Shougo/ddu.vim

# 特定のTOMLファイルに追加
dpp add Shougo/ddu.vim -t plugins/ui.toml

# プロファイルを指定して追加
dpp add Shougo/ddu.vim -p work
```

**引数:**
- `<repo>`: プラグインのリポジトリ（例: Shougo/ddu.vim）

**オプション:**
- `--on-cmd <cmd>`: コマンド遅延読み込み
- `--on-ft <filetype>`: ファイルタイプ遅延読み込み
- `--on-event <event>`: イベント遅延読み込み
- `--depends <plugins>`: 依存プラグイン（カンマ区切り）
- `--frozen`: バージョン固定
- `--branch, -b <name>`: ブランチ指定

**動作:**
1. 設定ファイルへのプラグイン追加
2. プラグインのクローン/インストール（dpp.vimに委譲）

### 3. `dpp remove`

プラグインを削除する。

```bash
dpp remove <repo>
```

**コマンド定義:**
```typescript
// src/commands/remove.ts
import { define } from "@gunshi/gunshi";

export const removeCommand = define({
  name: "remove",
  description: "Remove a plugin from dpp.vim configuration",
  args: {
    repo: {
      type: "positional",
      description: "Plugin repository to remove",
      required: true,
    },
  },
  run: async (ctx) => {
    const { repo } = ctx.values;
    // 実装ロジック
    // 1. 設定ファイルからプラグインを削除
    // 2. プラグインディレクトリの削除（dpp.vimに委譲）
  },
});
```

**動作:**
1. 設定ファイルからプラグインを削除
2. プラグインディレクトリの削除（dpp.vimに委譲）

### 4. `dpp update`

プラグインを更新する。

```bash
dpp update [repos...] [options]
```

**オプション:**
- `--all`: すべてのプラグインを更新
- `--parallel <n>`: 並列実行数（デフォルト: 4）
- `--dry-run`: 実行内容の確認のみ

**動作:**
1. dpp.vimの状態を確認
2. 更新が必要なプラグインの検出（dpp.vimに委譲）
3. 並列でプラグインを更新
4. dpp.vimの内部状態を更新

### 5. `dpp source`

Vim/Neovimで読み込むための設定を出力する。

```bash
dpp source [options]
```

**オプション:**
- `--format <vim|lua>`: 出力形式（デフォルト: 自動検出）
- `--editor <vim|nvim>`: 対象エディタ（デフォルト: 自動検出）

**動作:**
1. 設定ファイルの読み込み
2. 対象エディタに応じた Vim script または Lua コードの生成
3. 標準出力へ出力

### 6. `dpp check`

設定の妥当性をチェックする。

```bash
dpp check [options]
```

**オプション:**
- `--strict`: 厳密なチェック
- `--editor <vim|nvim>`: 対象エディタの確認

**動作:**
1. 設定ファイルの構文チェック
2. 型チェック（TypeScript設定の場合）
3. プラグインの存在確認
4. 依存関係の検証
5. 対象エディタとの互換性チェック

### 7. `dpp migrate`

他のプラグインマネージャーから移行する。

```bash
dpp migrate <from> [options]
```

**引数:**
- `<from>`: 移行元（dein, vim-plug, packer）

**オプション:**
- `--config <path>`: 移行元の設定ファイルパス
- `--dry-run`: 変換結果の確認のみ

**動作:**
1. 既存の設定ファイルの解析
2. dpp.vim形式への変換
3. 新しい設定ファイルの生成

### 8. `dpp doctor`

環境の診断と問題の検出を行う。

```bash
dpp doctor
```

**動作:**
1. Vim/Neovimのバージョン確認とインストール検出
2. dpp.vimのインストール確認
3. Denoのインストール確認（TypeScript設定の場合）
4. 設定ファイルの検証
5. プラグインの状態確認
6. 問題の報告と解決策の提示

## 設定ファイル形式

### TypeScript設定（Neovim推奨）

**Minimal テンプレート:**
```typescript
// dpp.ts
import type { Plugin } from "jsr:@shougo/dpp-vim";

export const config = {
  plugins: [
    { repo: "Shougo/dpp.vim" },
    { repo: "vim-denops/denops.vim" },
  ] satisfies Plugin[],
};
```

**Scaffold テンプレート:**
```typescript
// dpp.ts
import type { Plugin } from "jsr:@shougo/dpp-vim";

// dpp.vim configuration for Neovim
// See: https://github.com/Shougo/dpp.vim

export const config = {
  // Core plugins - required for dpp.vim to work
  plugins: [
    {
      repo: "Shougo/dpp.vim",
      // dpp.vim itself
    },
    {
      repo: "vim-denops/denops.vim",
      // Required for dpp.vim's TypeScript/Deno support
    },
    
    // Extension plugins for dpp.vim
    {
      repo: "Shougo/dpp-ext-installer",
      // Plugin installer extension
    },
    {
      repo: "Shougo/dpp-ext-lazy",
      // Lazy loading extension
    },
    {
      repo: "Shougo/dpp-protocol-git",
      // Git protocol support
    },
    
    // Example: UI framework
    {
      repo: "Shougo/ddu.vim",
      on_cmd: ["Ddu"],
      depends: ["denops.vim"],
    },
    
    // Example: Completion
    {
      repo: "Shougo/ddc.vim",
      on_event: ["InsertEnter"],
      depends: ["denops.vim"],
    },
  ] satisfies Plugin[],
  
  // Protocol configuration
  protocols: ["git"],
  
  // Extension options
  extOptions: {},
};
```

### TOML設定

**Minimal テンプレート:**
```toml
# dpp.toml

[[plugins]]
repo = "Shougo/dpp.vim"

[[plugins]]
repo = "vim-denops/denops.vim"
```

**Scaffold テンプレート:**
```toml
# dpp.toml
# dpp.vim configuration
# See: https://github.com/Shougo/dpp.vim

# Core plugins - required for dpp.vim to work
[[plugins]]
repo = "Shougo/dpp.vim"

[[plugins]]
repo = "vim-denops/denops.vim"

# Extension plugins for dpp.vim
[[plugins]]
repo = "Shougo/dpp-ext-installer"

[[plugins]]
repo = "Shougo/dpp-ext-lazy"

[[plugins]]
repo = "Shougo/dpp-protocol-git"

# Example: UI framework
[[plugins]]
repo = "Shougo/ddu.vim"
on_cmd = ["Ddu"]
depends = ["denops.vim"]

# Example: Completion
[[plugins]]
repo = "Shougo/ddc.vim"
on_event = ["InsertEnter"]
depends = ["denops.vim"]
```

### Lua設定（Neovim）

**Minimal テンプレート:**
```lua
-- dpp.lua
return {
  plugins = {
    { repo = "Shougo/dpp.vim" },
    { repo = "vim-denops/denops.vim" },
  },
}
```

**Scaffold テンプレート:**
```lua
-- dpp.lua
-- dpp.vim configuration for Neovim
-- See: https://github.com/Shougo/dpp.vim

return {
  -- Core plugins - required for dpp.vim to work
  plugins = {
    {
      repo = "Shougo/dpp.vim",
      -- dpp.vim itself
    },
    {
      repo = "vim-denops/denops.vim",
      -- Required for dpp.vim's TypeScript/Deno support
    },
    
    -- Extension plugins for dpp.vim
    {
      repo = "Shougo/dpp-ext-installer",
      -- Plugin installer extension
    },
    {
      repo = "Shougo/dpp-ext-lazy",
      -- Lazy loading extension
    },
    {
      repo = "Shougo/dpp-protocol-git",
      -- Git protocol support
    },
    
    -- Example: UI framework
    {
      repo = "Shougo/ddu.vim",
      on_cmd = { "Ddu" },
      depends = { "denops.vim" },
    },
    
    -- Example: Completion
    {
      repo = "Shougo/ddc.vim",
      on_event = { "InsertEnter" },
      depends = { "denops.vim" },
    },
  },
  
  -- Protocol configuration
  protocols = { "git" },
  
  -- Extension options
  extOptions = {},
}
```

### Vim script設定（Vim）

**Minimal テンプレート:**
```vim
" dpp.vim
" Minimal dpp.vim configuration

let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'

if !isdirectory(s:dpp_src)
  execute '!git clone https://github.com/Shougo/dpp.vim' s:dpp_src
endif

execute 'set runtimepath^=' .. s:dpp_src

call dpp#begin(s:dpp_base)

call dpp#add('Shougo/dpp.vim')
call dpp#add('vim-denops/denops.vim')

call dpp#end()
```

**Scaffold テンプレート:**
```vim
" dpp.vim
" dpp.vim configuration for Vim
" See: https://github.com/Shougo/dpp.vim

" Base directory for dpp.vim
let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'

" Bootstrap dpp.vim if not installed
if !isdirectory(s:dpp_src)
  execute '!git clone https://github.com/Shougo/dpp.vim' s:dpp_src
endif

execute 'set runtimepath^=' .. s:dpp_src

" Begin dpp.vim configuration
call dpp#begin(s:dpp_base)

" Core plugins - required for dpp.vim to work
call dpp#add('Shougo/dpp.vim')
call dpp#add('vim-denops/denops.vim')

" Extension plugins for dpp.vim
call dpp#add('Shougo/dpp-ext-installer')
call dpp#add('Shougo/dpp-ext-lazy')
call dpp#add('Shougo/dpp-protocol-git')

" Example: UI framework
call dpp#add('Shougo/ddu.vim', {
\   'on_cmd': ['Ddu'],
\   'depends': ['denops.vim'],
\ })

" Example: Completion
call dpp#add('Shougo/ddc.vim', {
\   'on_event': ['InsertEnter'],
\   'depends': ['denops.vim'],
\ })

" End dpp.vim configuration
call dpp#end()

" Install plugins on startup if needed
if dpp#check_install()
  call dpp#install()
endif
```

## 型定義

### パス解決の型

```typescript
// src/utils/paths.ts
export interface DppPaths {
  configDir: string;      // XDG_CONFIG_HOME/nvim (or vim)
  configFile: string;     // XDG_CONFIG_HOME/nvim/dpp.{format}
  cacheDir: string;       // XDG_CACHE_HOME/dpp
  pluginsDir: string;     // XDG_CACHE_HOME/dpp/repos/github.com
}

export function resolveDppPaths(options?: {
  configDir?: string;
  cacheDir?: string;
  format?: string;
  editor?: "vim" | "nvim";
}): DppPaths {
  const home = Deno.env.get("HOME") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || `${home}/.config`;
  const xdgCacheHome = Deno.env.get("XDG_CACHE_HOME") || `${home}/.cache`;
  
  const editor = options?.editor || "nvim";
  const configDir = options?.configDir || `${xdgConfigHome}/${editor}`;
  const cacheDir = options?.cacheDir || `${xdgCacheHome}/dpp`;
  const format = options?.format || "ts";
  
  return {
    configDir,
    configFile: `${configDir}/dpp.${format}`,
    cacheDir,
    pluginsDir: `${cacheDir}/repos/github.com`,
  };
}
```

### グローバル設定の型

```typescript
// src/types/config.ts
// グローバル設定ファイル: XDG_CONFIG_HOME/dpp-cli/config.json
export interface GlobalConfig {
  version: string;
  profiles: Record<string, Profile>;
  activeProfile: string;
}

export interface Profile {
  name: string;
  configDir: string;           // ~/.config/nvim
  editor: "vim" | "nvim";
  mainConfig: string;          // dpp.ts or dpp.vim
  tomlFiles: TomlFileEntry[];  // 使用されているTOMLファイルのリスト
  defaultToml?: string;        // addコマンドのデフォルトTOML
  lastModified: string;
}

export interface TomlFileEntry {
  path: string;                // ~/.config/nvim/dpp.toml
  description?: string;        // "Core plugins", "LSP plugins" etc.
  relativePath: string;        // dpp.toml or plugins/lsp.toml
}

// デフォルト設定
export function createDefaultGlobalConfig(): GlobalConfig {
  return {
    version: "0.1.0",
    profiles: {},
    activeProfile: "default",
  };
}

export function createDefaultProfile(editor: "vim" | "nvim"): Profile {
  const home = Deno.env.get("HOME") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || `${home}/.config`;
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
```

### コマンドの型

```typescript
// src/types/commands.ts
import type { CommandContext as GunshiContext } from "@gunshi/gunshi";

// gunshiのCommandContextを拡張
export type CommandContext = GunshiContext;

// 各コマンドの値の型
export interface InitCommandValues {
  format: "ts" | "toml" | "lua" | "vim";
  path?: string;
  template: "minimal" | "scaffold";
  editor: "vim" | "nvim";
  profile?: string;  // プロファイル名
}

export interface AddCommandValues {
  repo: string;
  toml?: string;     // 対象TOMLファイル（相対パス）
  onCmd?: string;
  onFt?: string;
  onEvent?: string;
  depends?: string;
  frozen?: boolean;
  branch?: string;
  profile?: string;  // プロファイル名
}

export interface RemoveCommandValues {
  repo: string;
  toml?: string;     // 対象TOMLファイル（相対パス）
  profile?: string;  // プロファイル名
}

export interface UpdateCommandValues {
  repos?: string[];
  all?: boolean;
  parallel?: number;
  dryRun?: boolean;
  profile?: string;  // プロファイル名
}
```

### グローバル設定管理のユーティリティ

```typescript
// src/utils/global-config.ts
import { join } from "@std/path";
import type { GlobalConfig, Profile, TomlFileEntry } from "../types/config.ts";
import { createDefaultGlobalConfig } from "../types/config.ts";

const CONFIG_DIR = ".config/dpp-cli";
const CONFIG_FILE = "config.json";

// グローバル設定ファイルのパスを取得
export function getGlobalConfigPath(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") || join(home, ".config");
  return join(xdgConfigHome, CONFIG_DIR, CONFIG_FILE);
}

// グローバル設定を読み込む
export async function loadGlobalConfig(): Promise<GlobalConfig> {
  const configPath = getGlobalConfigPath();
  
  try {
    const content = await Deno.readTextFile(configPath);
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return createDefaultGlobalConfig();
    }
    throw error;
  }
}

// グローバル設定を保存
export async function saveGlobalConfig(config: GlobalConfig): Promise<void> {
  const configPath = getGlobalConfigPath();
  const configDir = join(configPath, "..");
  
  await Deno.mkdir(configDir, { recursive: true });
  await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
}

// アクティブプロファイルを取得
export async function getActiveProfile(): Promise<Profile | null> {
  const config = await loadGlobalConfig();
  return config.profiles[config.activeProfile] || null;
}

// プロファイルを取得（名前指定またはアクティブ）
export async function getProfile(name?: string): Promise<Profile | null> {
  if (!name) {
    return await getActiveProfile();
  }
  
  const config = await loadGlobalConfig();
  return config.profiles[name] || null;
}

// プロファイルを保存
export async function saveProfile(profile: Profile): Promise<void> {
  const config = await loadGlobalConfig();
  
  config.profiles[profile.name] = {
    ...profile,
    lastModified: new Date().toISOString(),
  };
  
  // 初めてのプロファイルならアクティブに設定
  if (Object.keys(config.profiles).length === 1) {
    config.activeProfile = profile.name;
  }
  
  await saveGlobalConfig(config);
}

// TOMLファイルを検出してプロファイルに追加
export async function detectAndAddTomlFiles(
  profile: Profile,
): Promise<TomlFileEntry[]> {
  const tomlFiles: TomlFileEntry[] = [];
  
  try {
    for await (const entry of Deno.readDir(profile.configDir)) {
      if (entry.isFile && entry.name.endsWith(".toml")) {
        tomlFiles.push({
          path: join(profile.configDir, entry.name),
          relativePath: entry.name,
        });
      }
    }
    
    // plugins/ ディレクトリも検索
    const pluginsDir = join(profile.configDir, "plugins");
    try {
      for await (const entry of Deno.readDir(pluginsDir)) {
        if (entry.isFile && entry.name.endsWith(".toml")) {
          tomlFiles.push({
            path: join(pluginsDir, entry.name),
            relativePath: join("plugins", entry.name),
          });
        }
      }
    } catch {
      // plugins/ ディレクトリがない場合はスキップ
    }
  } catch (error) {
    console.error("Error detecting TOML files:", error);
  }
  
  return tomlFiles;
}

// デフォルトTOMLファイルを取得（指定またはプロファイルのデフォルト）
export async function getTargetToml(
  specifiedToml?: string,
  profile?: Profile,
): Promise<string> {
  const activeProfile = profile || await getActiveProfile();
  
  if (!activeProfile) {
    throw new Error("No active profile found. Run 'dpp init' first.");
  }
  
  // --toml が指定されていればそれを使用
  if (specifiedToml) {
    return join(activeProfile.configDir, specifiedToml);
  }
  
  // defaultToml が設定されていればそれを使用
  if (activeProfile.defaultToml) {
    return activeProfile.defaultToml;
  }
  
  // TOMLファイルが1つしかなければそれを使用
  if (activeProfile.tomlFiles.length === 1) {
    return activeProfile.tomlFiles[0].path;
  }
  
  // 複数ある場合はエラー
  if (activeProfile.tomlFiles.length > 1) {
    throw new Error(
      `Multiple TOML files found. Please specify with --toml option:\n${
        activeProfile.tomlFiles.map((f) => `  - ${f.relativePath}`).join("\n")
      }`,
    );
  }
  
  // TOMLファイルがない場合はデフォルトを使用
  return join(activeProfile.configDir, "dpp.toml");
}
```

### テンプレートコンテキストの型

```typescript
// src/types/template.ts
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
```

### 設定の型

```typescript
// src/types/config.ts
// dpp.vimの公式型定義を使用
import type {
  DppOptions,
  ExtOptions,
  Plugin,
  ProtocolName,
  ProtocolOptions,
} from "jsr:@shougo/dpp-vim";

// CLI用の設定型定義
// dpp.vimのDppOptionsをベースに拡張
export interface Config {
  plugins: Plugin[];
  protocols?: ProtocolName[];
  extOptions?: Record<string, Partial<ExtOptions>>;
  extParams?: Record<string, Record<string, unknown>>;
  protocolOptions?: Record<ProtocolName, Partial<ProtocolOptions>>;
  protocolParams?: Record<ProtocolName, Record<string, unknown>>;
}

// dpp.vimの型をそのまま使用
// https://jsr.io/@shougo/dpp-vim
export type {
  DppOptions,
  ExtOptions,
  Plugin,
  ProtocolName,
  ProtocolOptions,
};
```

## エラーハンドリング

### エラーの種類

1. **設定エラー**: 設定ファイルの構文エラー、型エラー
2. **ネットワークエラー**: プラグインのクローン/更新失敗
3. **ファイルシステムエラー**: 権限エラー、ディスク容量不足
4. **互換性エラー**: vim/neovim間の互換性問題、dpp.vimバージョン

### エラーメッセージの原則

- 何が問題かを明確に表示
- 問題の原因を説明
- 解決方法を提示
- 関連するドキュメントへのリンク

**例:**

```
Error: Failed to parse configuration file

Caused by:
  Unexpected token '}' at line 10, column 3

Hint:
  Check for missing commas or brackets in your configuration.
  
See: https://github.com/your-org/dpp-cli/docs/configuration.md
```

## パフォーマンス最適化

### 並列処理

- プラグインの更新/インストールを並列実行（dpp.vimに委譲）
- デフォルトで4並列、`--parallel`オプションで調整可能
- Denoの Worker を活用した効率的な並列処理

### キャッシング

- プラグインのメタデータをキャッシュ（dpp.vimが管理）
- GitHubのAPIレート制限対策
- dpp.vimの内部キャッシュ機構を活用

### 差分更新

- 変更のあったプラグインのみ更新
- dpp.vimの状態管理を利用した効率的な更新

## テスト戦略

### ユニットテスト

- 各コマンドの個別機能テスト
- 設定パーサーのテスト
- バリデーターのテスト

### 統合テスト

- コマンドのエンドツーエンドテスト
- 実際のGitリポジトリを使用したテスト

### テストツール

- Deno標準のテストフレームワーク
- モックファイルシステム
- テスト用の一時ディレクトリ

## セキュリティ考慮事項

### 信頼できるソース

- GitHubなどの信頼できるホストからのみプラグインを取得
- HTTPS通信の強制
- SSL証明書の検証

### コード実行の制限

- 設定ファイル内の任意コード実行の制限
- サンドボックス環境での設定評価

### 権限管理

- 必要最小限のファイルシステムアクセス
- Denoの権限システムの活用

## リリース計画

### Phase 1: MVP（v0.1.0）

- 基本コマンドの実装（init, add, remove, update）
- vim/neovim選択機能
- TypeScript設定のサポート
- minimal/scaffoldテンプレート（TypeScript）

### Phase 2: 多様な設定形式（v0.2.0）

- TOML設定のサポート
- Lua設定のサポート（Neovim）
- Vim script設定のサポート（Vim）
- 全形式でのminimal/scaffoldテンプレート
- エラーハンドリングの改善

### Phase 3: 高度な機能（v0.3.0）

- check, migrate, doctorコマンドの追加
- インタラクティブモードの実装
- テストカバレッジの向上
- ドキュメント整備

### Phase 4: 安定版（v1.0.0）

- すべての機能の安定化
- 包括的なドキュメント
- コミュニティフィードバックの反映
- vim/neovim両方での完全な動作保証

## 参考資料

- [sheldon](https://github.com/rossmacarthur/sheldon)
- [dpp.vim](https://github.com/Shougo/dpp.vim)
- [Deno Documentation](https://deno.land/manual)
- [gunshi](https://github.com/kazupon/gunshi)

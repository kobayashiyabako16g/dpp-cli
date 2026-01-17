# dpp-cli

[dpp.vim](https://github.com/Shougo/dpp.vim) プラグインを型安全かつ簡単に管理するためのモダンなCLIツール。

## 特徴

- 🎯 **型安全な設定** - TOMLプラグインを読み込むTypeScript設定
- 📝 **エディタ固有のセットアップ** - NeovimはLua、VimはVim script
- 🔌 **統一されたプラグイン管理** - すべてのプラグインはdpp.tomlで管理
- 🚀 **簡単な初期化** - minimalまたはscaffoldテンプレートで素早くセットアップ

## インストール

### Denoを使用

```bash
deno install --allow-read --allow-write --allow-env --allow-run --allow-net -n dpp https://raw.githubusercontent.com/yourusername/dpp-cli/main/main.ts
```

### ソースから

```bash
git clone https://github.com/yourusername/dpp-cli.git
cd dpp-cli
deno install --allow-read --allow-write --allow-env --allow-run --allow-net -n dpp main.ts
```

## クイックスタート

### 1. 新しい設定を初期化

```bash
# Neovim（Lua + TOML + TypeScript設定を作成）
dpp init -t minimal -e nvim

# Vim（Vim script + TOML + TypeScript設定を作成）
dpp init -t minimal -e vim

# より多くの機能を持つscaffoldテンプレート
dpp init -t scaffold -e nvim
```

### 2. プラグインの追加

設定フォーマットに関わらず、すべてのプラグインは`dpp.toml`で管理されます：

```bash
# プラグインを追加
dpp add Shougo/ddu.vim

# 遅延読み込みで追加
dpp add Shougo/ddc.vim --on-cmd Ddc

# 依存関係を指定して追加
dpp add Shougo/ddu-ui-ff --depends denops.vim
```

### 3. プラグインの削除

```bash
dpp remove Shougo/ddu-ui-ff
```

### 4. プラグイン設定の編集

```bash
# お好みのエディタで設定を編集
dpp edit

# 特定のプロファイルを編集
dpp edit -p myprofile
```

エディタは`$EDITOR`または`$VISUAL`環境変数で決定され、設定されていない場合は`vi`（Unix）または`notepad`（Windows）にフォールバックします。

### 5. 設定のクリーンアップ

```bash
# すべての設定ファイル、キャッシュ、プロファイルを削除
dpp clean

# 確認プロンプトをスキップ
dpp clean --force
```

## コマンド

### `dpp init`

新しいdpp.vim設定を初期化します。

**オプション:**

- `-t, --template <minimal|scaffold>` - テンプレートタイプ（デフォルト: minimal）
- `-e, --editor <vim|nvim>` - 対象エディタ（デフォルト: nvim）
- `-p, --path <dir>` - カスタム設定ディレクトリ
- `--profile <name>` - プロファイル名（デフォルト: default）

**作成されるファイル:**

- **Neovim**: `dpp.lua` (メイン設定) + `dpp.toml` (プラグイン) + `dpp.ts` (TypeScriptローダー)
- **Vim**: `dpp.vim` (メイン設定) + `dpp.toml` (プラグイン) + `dpp.ts` (TypeScriptローダー)

**例:**

```bash
dpp init -t scaffold -e nvim
```

### `dpp add`

設定にプラグインを追加します。

**引数:**

- `<repo>` - プラグインリポジトリ（複数の形式をサポート）:
  - `owner/repo` (例: `Shougo/ddu.vim`)
  - `https://github.com/owner/repo`
  - `https://github.com/owner/repo.git`
  - `git@github.com:owner/repo.git`

**オプション:**

- `--on-cmd <cmd>` - コマンド実行時に遅延読み込み
- `--on-ft <filetype>` - ファイルタイプに応じて遅延読み込み
- `--on-event <event>` - イベント発生時に遅延読み込み
- `--depends <plugins>` - プラグインの依存関係（カンマ区切り）
- `-b, --branch <name>` - ブランチを指定
- `-t, --toml <file>` - 対象TOMLファイル
- `-p, --profile <name>` - 使用するプロファイル

**例:**

```bash
# シンプルな追加（すべての形式が使用可能）
dpp add Shougo/ddu.vim
dpp add https://github.com/Shougo/ddu.vim
dpp add git@github.com:Shougo/ddu.vim.git

# 遅延読み込みあり
dpp add Shougo/ddc.vim --on-event InsertEnter

# 依存関係あり
dpp add Shougo/ddu-ui-ff --depends denops.vim
```

### `dpp remove`

設定からプラグインを削除します。

**引数:**

- `<repo>` - 削除するプラグインリポジトリ（複数の形式をサポート）:
  - `owner/repo` (例: `Shougo/ddu.vim`)
  - `https://github.com/owner/repo`
  - `https://github.com/owner/repo.git`
  - `git@github.com:owner/repo.git`

**例:**

```bash
# すべての形式で削除可能
dpp remove Shougo/ddu-ui-ff
dpp remove https://github.com/Shougo/ddu-ui-ff.git
```

### `dpp edit`

お好みのエディタでTOML設定ファイルを編集します。

**オプション:**

- `-p, --profile <name>` - 編集するプロファイル（デフォルト: アクティブプロファイル）

**例:**

```bash
# アクティブプロファイルの設定を編集
dpp edit

# 特定のプロファイルを編集
dpp edit -p myprofile

# カスタムエディタを使用
EDITOR="code --wait" dpp edit
```

**注意:**

- エディタは`$EDITOR`または`$VISUAL`環境変数で決定されます
- 設定されていない場合、`vi`（Unix/Linux/macOS）または`notepad`（Windows）にフォールバックします
- プロファイルのデフォルトTOMLファイル（`dpp.toml`）を開きます
- バリデーションやバックアップは行われません（手動編集を信頼します）

### `dpp clean`

すべてのdpp設定ファイル、キャッシュディレクトリ、プロファイルを削除します。

**オプション:**

- `-p, --profile <name>` - クリーンするプロファイル名（デフォルト: アクティブプロファイル）
- `-f, --force` - 確認プロンプトをスキップ

**削除される内容:**

- **設定ファイル**: メイン設定（`dpp.lua` または `dpp.vim`）、TypeScript設定（`dpp.ts`）、TOMLファイル（`dpp.toml`）
- **キャッシュディレクトリ**: `~/.cache/dpp/`（ディレクトリ全体）
- **プロファイル**: グローバル設定からプロファイルエントリ

**例:**

```bash
# 確認プロンプト付きでクリーン
dpp clean

# 特定のプロファイルをクリーン
dpp clean --profile my-profile

# 確認なしでクリーン（スクリプト用）
dpp clean --force
```

**注意:** 非対話モード（CI/CDなど）では、`--force`フラグが必須です。

## 設定フォーマット

### 仕組み

**すべての設定は3つのファイルを使用します：**

1. **メイン設定** (`dpp.lua` または `dpp.vim`) - ブートストラップとランタイム設定
2. **プラグイン定義** (`dpp.toml`) - すべてのプラグインをここで管理
3. **TypeScriptローダー** (`dpp.ts`) - TOMLファイルの読み込みと処理

メイン設定は`dpp#make_state()`を呼び出し、`dpp.ts`を使用して`dpp.toml`を読み込み、プラグインの状態を生成します。

### Neovim（Lua + TOML + TypeScript）

```lua
-- ~/.config/nvim/dpp.lua
local dpp_base = vim.fn.expand("~/.cache/dpp")
local dpp_src = dpp_base .. "/repos/github.com/Shougo/dpp.vim"
local config_dir = vim.fn.expand("~/.config/nvim")
local dpp_config = config_dir .. "/dpp.ts"

vim.opt.runtimepath:prepend(dpp_src)

if vim.fn["dpp#min#load_state"](dpp_base) == 1 then
  -- 最初から初期化
  vim.api.nvim_create_autocmd("User", {
    pattern = "DenopsReady",
    callback = function()
      vim.fn["dpp#make_state"](dpp_base, dpp_config)
    end,
  })
end
```

### Vim（Vim script + TOML + TypeScript）

```vim
" ~/.config/vim/dpp.vim
let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'
let s:config_dir = expand('~/.config/vim')
let s:dpp_config = s:config_dir .. '/dpp.ts'

execute 'set runtimepath^=' .. s:dpp_src

if dpp#min#load_state(s:dpp_base)
  " 最初から初期化
  autocmd User DenopsReady
    \ call dpp#make_state(s:dpp_base, s:dpp_config)
endif
```

### TypeScript（設定ローダー）

```typescript
// ~/.config/nvim/dpp.ts
import type { Denops } from "jsr:@denops/std@~7.6.0";
import type { ContextBuilder, Dpp } from "jsr:@shougo/dpp-vim@~4.5.0/types";
import {
  BaseConfig,
  type ConfigReturn,
} from "jsr:@shougo/dpp-vim@~4.5.0/config";

export class Config extends BaseConfig {
  override async config(args: {
    denops: Denops;
    contextBuilder: ContextBuilder;
    basePath: string;
    dpp: Dpp;
  }): Promise<ConfigReturn> {
    args.contextBuilder.setGlobal({
      protocols: ["git"],
    });

    const tomlPromises = [
      args.dpp.extAction(
        args.denops,
        args.contextBuilder,
        "toml",
        "load",
        {
          path: await args.denops.call(
            "expand",
            "~/.config/nvim/dpp.toml",
          ) as string,
        },
      ),
    ];

    await Promise.all(tomlPromises);

    return {
      checkFiles: [],
    };
  }
}
```

### TOML（プラグイン定義）

このファイルは**すべての**設定フォーマットで使用されます：

```toml
# ~/.config/nvim/dpp.toml
[[plugins]]
repo = "Shougo/dpp.vim"

[[plugins]]
repo = "vim-denops/denops.vim"

[[plugins]]
repo = "Shougo/dpp-ext-toml"

[[plugins]]
repo = "Shougo/ddu.vim"
on_cmd = ["Ddu"]
depends = ["denops.vim"]
```

## テンプレート

### Minimalテンプレート

必須プラグインのみを含みます：

- `Shougo/dpp.vim` - プラグインマネージャー本体
- `vim-denops/denops.vim` - dpp.vimの動作に必要

### Scaffoldテンプレート

追加の推奨プラグインを含みます：

- コアdpp.vimプラグイン
- 拡張プラグイン（installer、lazy loader、git protocol）
- サンプルプラグイン（ddu.vim、ddc.vim）と遅延読み込み設定

## プロファイル

dpp-cliは複数の設定プロファイルをサポートしています。

```bash
# workプロファイルを作成
dpp init -f ts -t minimal -e nvim --profile work

# workプロファイルにプラグインを追加
dpp add Shougo/ddu.vim -p work
```

プロファイルは`~/.config/dpp-cli/config.json`に保存されます。

## ディレクトリ構造

```
~/.config/
├── dpp-cli/
│   └── config.json         # プロファイル設定
├── nvim/                   # Neovim設定
│   ├── dpp.ts             # ブートストラップ（TypeScript）
│   ├── dpp.lua            # またはブートストラップ（Lua）
│   └── dpp.toml           # プラグイン定義（常に存在）
└── vim/                    # Vim設定
    ├── dpp.vim            # ブートストラップ（Vim script）
    └── dpp.toml           # プラグイン定義（常に存在）

~/.cache/dpp/              # プラグインキャッシュ（dpp.vimが管理）
└── repos/
    └── github.com/
        └── Shougo/
            └── dpp.vim/
```

## 必要要件

- **Deno** 2.0以降
- **Vim** 9.0以上または**Neovim** 0.9以上
- **Git** プラグインのクローン用
- **denops.vim**（dpp.vimが自動的にインストール）

## トラブルシューティング

### よくある問題

**Q: "No profile found"エラーが出る**

A: まず`dpp init`を実行してプロファイルを作成してください。

**Q: プラグインが読み込まれない**

A: init.vim/init.luaでdpp.vimが適切に設定されているか確認してください。[dpp.vimドキュメント](https://github.com/Shougo/dpp.vim)を参照してください。

**Q: TypeScript設定が動作しない**

A: Denoがインストールされており、dpp.vimがTypeScript設定を使用するよう設定されているか確認してください。

## 開発

### テストの実行

```bash
deno test --allow-read --allow-write --allow-env --allow-run --allow-net
```

### ビルド

```bash
deno compile --allow-read --allow-write --allow-env --allow-run --allow-net -o dpp main.ts
```

## コントリビューション

コントリビューションを歓迎します！詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

## ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)を参照してください。

## 関連プロジェクト

- [dpp.vim](https://github.com/Shougo/dpp.vim) - Dark powered plugin manager
- [sheldon](https://github.com/rossmacarthur/sheldon) - このCLIツールのインスピレーション元
- [denops.vim](https://github.com/vim-denops/denops.vim) - Vim/Neovimプラグインのエコシステム

## 謝辞

- [Shougo](https://github.com/Shougo) - dpp.vimの作者
- [Ross MacArthur](https://github.com/rossmacarthur) - sheldonのデザインインスピレーション

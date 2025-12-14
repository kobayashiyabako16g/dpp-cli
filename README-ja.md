# dpp-cli

[dpp.vim](https://github.com/Shougo/dpp.vim) プラグインを型安全かつ簡単に管理するためのモダンなCLIツール。

## 特徴

- 🎯 **型安全な設定** - dpp.vimのTypeScript型を活用
- 📝 **複数のフォーマット対応** - TypeScript、TOML、Lua、Vim scriptをサポート
- 🔌 **統一されたプラグイン管理** - すべてのフォーマットでTOMLによるプラグイン定義を使用
- 🚀 **簡単な初期化** - minimalまたはscaffoldテンプレートで素早くセットアップ
- 🩺 **環境診断** - `dpp doctor`で環境をチェック
- ✅ **設定の検証** - `dpp check`で設定を検証

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
# Neovim用TypeScript設定（推奨）
dpp init -f ts -t minimal -e nvim

# TOML設定
dpp init -f toml -t scaffold -e nvim

# Neovim用Lua設定
dpp init -f lua -t minimal -e nvim

# Vim用Vim script設定
dpp init -f vim -t minimal -e vim
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

### 4. 設定のチェック

```bash
# 基本チェック
dpp check

# 厳格モード
dpp check --strict
```

### 5. 環境診断

```bash
dpp doctor
```

## コマンド

### `dpp init`

新しいdpp.vim設定を初期化します。

**オプション:**
- `-f, --format <ts|toml|lua|vim>` - 設定ファイルのフォーマット（デフォルト: ts）
- `-t, --template <minimal|scaffold>` - テンプレートタイプ（デフォルト: minimal）
- `-e, --editor <vim|nvim>` - 対象エディタ（デフォルト: nvim）
- `-p, --profile <name>` - プロファイル名（デフォルト: default）

**例:**
```bash
dpp init -f ts -t scaffold -e nvim
```

### `dpp add`

設定にプラグインを追加します。

**引数:**
- `<repo>` - プラグインリポジトリ（例: Shougo/ddu.vim）

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
# シンプルな追加
dpp add Shougo/ddu.vim

# 遅延読み込みあり
dpp add Shougo/ddc.vim --on-event InsertEnter

# 依存関係あり
dpp add Shougo/ddu-ui-ff --depends denops.vim
```

### `dpp remove`

設定からプラグインを削除します。

**引数:**
- `<repo>` - 削除するプラグインリポジトリ

**例:**
```bash
dpp remove Shougo/ddu-ui-ff
```

### `dpp update`

プラグインを更新します（dpp.vimに委譲）。

**オプション:**
- `--all` - すべてのプラグインを更新
- `--parallel <n>` - 並列更新数（デフォルト: 4）
- `--dry-run` - 更新内容を表示のみ

**例:**
```bash
# すべてのプラグインを更新
dpp update --all

# 特定のプラグインを更新
dpp update Shougo/ddu.vim Shougo/ddc.vim
```

### `dpp check`

設定の妥当性をチェックします。

**オプション:**
- `--strict` - 厳格なチェックを有効化
- `-e, --editor <vim|nvim>` - 対象エディタ
- `-p, --profile <name>` - チェックするプロファイル

**例:**
```bash
dpp check --strict
```

### `dpp doctor`

環境を診断して問題を検出します。

**オプション:**
- `-p, --profile <name>` - チェックするプロファイル

**例:**
```bash
dpp doctor
```

## 設定フォーマット

### 仕組み

**すべての設定フォーマットで`dpp.toml`をプラグイン管理に使用します。** メインの設定ファイル（TypeScript/Lua/Vim）は、`dpp.toml`からプラグインを読み込むブートストラップとして機能します。

### TypeScript（Neovim推奨）

```typescript
// ~/.config/nvim/dpp.ts
import type { Denops } from "jsr:@denops/std@~7.6.0";
import type {
  ContextBuilder,
  Dpp,
} from "jsr:@shougo/dpp-vim@~4.5.0/types";
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
          path: await args.denops.call("expand", "~/.config/nvim/dpp.toml") as string,
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

### Lua（Neovim）

```lua
-- ~/.config/nvim/dpp.lua
local dpp_base = vim.fn.expand("~/.cache/dpp")
local dpp_config = vim.fn.expand("~/.config/nvim")

if vim.fn["dpp#min#load_state"](dpp_base) then
  vim.opt.runtimepath:prepend(dpp_base .. "/repos/github.com/Shougo/dpp.vim")
  vim.opt.runtimepath:prepend(dpp_base .. "/repos/github.com/vim-denops/denops.vim")
  vim.opt.runtimepath:prepend(dpp_base .. "/repos/github.com/Shougo/dpp-ext-toml")

  vim.api.nvim_create_autocmd("User", {
    pattern = "DenopsReady",
    callback = function()
      vim.fn["dpp#make_state"](dpp_base, dpp_config .. "/dpp.toml")
    end,
  })
end

vim.cmd("filetype indent plugin on")
vim.cmd("syntax on")
```

### Vim Script（Vim）

```vim
" ~/.config/vim/dpp.vim
let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_config = expand('~/.config/vim')

if dpp#min#load_state(s:dpp_base)
  set runtimepath+=$HOME/.cache/dpp/repos/github.com/Shougo/dpp.vim
  set runtimepath+=$HOME/.cache/dpp/repos/github.com/vim-denops/denops.vim
  set runtimepath+=$HOME/.cache/dpp/repos/github.com/Shougo/dpp-ext-toml

  autocmd User DenopsReady
    \ call dpp#make_state(s:dpp_base, s:dpp_config .. '/dpp.toml')
endif

filetype indent plugin on
syntax on
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

# workプロファイルをチェック
dpp check -p work
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

### 環境のチェック

```bash
dpp doctor
```

以下の項目をチェックします：
- Denoのインストールとバージョン
- Vim/Neovimのインストールとバージョン
- Gitのインストール
- dpp.vimのインストール
- 設定ファイル
- ネットワーク接続

### 設定の検証

```bash
dpp check --strict
```

以下の項目をチェックします：
- 設定ファイルの構文
- エディタの互換性
- TOMLファイルの妥当性
- 型の正確性（TypeScript用）

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

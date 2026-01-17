# dpp-cli

> [!WARNING]
> dpp.vimの作者は「設定したくないならプラグインマネージャーを使う必要はない。ゼロコンフィグでは動作しない」と明言しています。このCLIを使うということは、その哲学に背いていることになります。今すぐこのタブを閉じて、手動でdpp.vimを設定すべきです。
>
> ...まだここにいますか？良いでしょう。このツールはdpp.vimのミニマリズム精神に反していますが、dpp.vimの動作を理解するための補助輪として役立つことを願っています。慣れてきたら、正しいことをしてください：このCLIを削除して、すべてを自分で設定しましょう。

[dpp.vim](https://github.com/Shougo/dpp.vim) プラグインを型安全かつ簡単に管理するためのモダンなCLIツール。

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

## 必要要件

- **Deno** 2.0以降
- **Vim** 9.0以上または**Neovim** 0.9以上
- **Git** プラグインのクローン用
- **denops.vim**（dpp.vimが自動的にインストール）

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

コントリビューションを歓迎します！

## ライセンス

MITライセンス - 詳細は[LICENSE](LICENSE)を参照してください。

## 謝辞

- [dpp.vim](https://github.com/Shougo/dpp.vim) - Dark powered plugin manager
- [sheldon](https://github.com/rossmacarthur/sheldon) - このCLIツールのインスピレーション元
- [denops.vim](https://github.com/vim-denops/denops.vim) - Vim/Neovimプラグインのエコシステム

# dpp-cli

> [!WARNING]\
> dpp.vim's author explicitly states it "does not work with zero configuration." By using this CLI, you are technically betraying that philosophy. You should close this tab immediately and configure dpp.vim manually.
>
> ...Still here? Good. While this tool goes against dpp.vim's minimalist spirit, we hope it serves as training wheels for understanding how dpp.vim actually works. Once you get comfortable, please do the right thing: delete this CLI and configure everything yourself.

A modern CLI tool for managing [dpp.vim](https://github.com/Shougo/dpp.vim) plugins with type safety and ease of use.

## Installation

### Using JSR (Recommended)

```bash
deno install -gA jsr:@yabako/dpp-cli
```

### Using Homebrew

```bash
brew tap kobayashiyabako16g/tap
brew install dpp-cli
```

Or with explicit permissions:

```bash
deno install -g --allow-read --allow-write --allow-env --allow-run --allow-net jsr:@yabako/dpp-cli
```

### From Source

```bash
git clone https://github.com/kobayashiyabako16g/dpp-cli.git
cd dpp-cli
deno install --allow-read --allow-write --allow-env --allow-run --allow-net -n dpp-cli main.ts
```

## Quick Start

### 1. Initialize a new configuration

```bash
# Neovim (creates Lua + TypeScript config)
dpp-cli init -t minimal -e nvim

# Vim (creates Vim script + TOML + TypeScript config)
dpp-cli init -t minimal -e vim

# Scaffold template with more features
dpp-cli init -t scaffold -e nvim
```

### 2. Add plugins

All plugins are managed in `dpp.toml` regardless of your configuration format:

```bash
# Add a plugin
dpp-cli add Shougo/ddu.vim

# Add with lazy loading
dpp-cli add Shougo/ddc.vim --on-cmd Ddc

# Add with dependencies
dpp-cli add Shougo/ddu-ui-ff --depends denops.vim
```

### 3. Remove plugins

```bash
dpp-cli remove Shougo/ddu-ui-ff
```

### 4. Edit plugin configuration

```bash
# Edit configuration in your preferred editor
dpp-cli edit

# Edit specific profile
dpp-cli edit -p myprofile
```

The editor is determined by the `$EDITOR` or `$VISUAL` environment variable, falling back to `vi` (Unix) or `notepad` (Windows).

### 5. Clean up configuration

```bash
# Remove all configuration files, cache, and profile
dpp-cli clean

# Skip confirmation prompt
dpp-cli clean --force
```

## Commands

### `dpp-cli init`

Initialize a new dpp.vim configuration.

**Options:**

- `-t, --template <minimal|scaffold>` - Template type (default: minimal)
- `-e, --editor <vim|nvim>` - Target editor (default: nvim)
- `-p, --path <dir>` - Custom configuration directory
- `--profile <name>` - Profile name (default: default)

**What gets created:**

- **Neovim**: `dpp.lua` (main config) + `dpp.toml` (plugins) + `dpp.ts` (TypeScript loader)
- **Vim**: `dpp.vim` (main config) + `dpp.toml` (plugins) + `dpp.ts` (TypeScript loader)

**Example:**

```bash
dpp-cli init -t scaffold -e nvim
```

### `dpp-cli add`

Add a plugin to your configuration.

**Arguments:**

- `<repo>` - Plugin repository (supports multiple formats):
  - `owner/repo` (e.g., `Shougo/ddu.vim`)
  - `https://github.com/owner/repo`
  - `https://github.com/owner/repo.git`
  - `git@github.com:owner/repo.git`

**Options:**

- `--on-cmd <cmd>` - Lazy load on command
- `--on-ft <filetype>` - Lazy load on filetype
- `--on-event <event>` - Lazy load on event
- `--depends <plugins>` - Plugin dependencies (comma-separated)
- `-b, --branch <name>` - Specify branch
- `-t, --toml <file>` - Target TOML file
- `-p, --profile <name>` - Profile to use

**Examples:**

```bash
# Simple add (all formats work)
dpp-cli add Shougo/ddu.vim
dpp-cli add https://github.com/Shougo/ddu.vim
dpp-cli add git@github.com:Shougo/ddu.vim.git

# With lazy loading
dpp-cli add Shougo/ddc.vim --on-event InsertEnter

# With dependencies
dpp-cli add Shougo/ddu-ui-ff --depends denops.vim
```

### `dpp-cli remove`

Remove a plugin from your configuration.

**Arguments:**

- `<repo>` - Plugin repository to remove (supports multiple formats):
  - `owner/repo` (e.g., `Shougo/ddu.vim`)
  - `https://github.com/owner/repo`
  - `https://github.com/owner/repo.git`
  - `git@github.com:owner/repo.git`

**Examples:**

```bash
# All formats work for removal
dpp-cli remove Shougo/ddu-ui-ff
dpp-cli remove https://github.com/Shougo/ddu-ui-ff.git
```

### `dpp-cli edit`

Edit the TOML configuration file in your preferred editor.

**Options:**

- `-p, --profile <name>` - Profile to edit (default: active profile)

**Examples:**

```bash
# Edit active profile's configuration
dpp-cli edit

# Edit specific profile
dpp-cli edit -p myprofile

# Use custom editor
EDITOR="code --wait" dpp-cli edit
```

**Notes:**

- The editor is determined by the `$EDITOR` or `$VISUAL` environment variable
- Falls back to `vi` (Unix/Linux/macOS) or `notepad` (Windows) if not set
- Opens the profile's default TOML file (`dpp.toml`)
- No validation or backup is performed (manual editing is trusted)

### `dpp-cli clean`

Remove all dpp-cli configuration files, cache directory, and profile.

**Options:**

- `-p, --profile <name>` - Profile name to clean (default: active profile)
- `-f, --force` - Skip confirmation prompt

**What gets deleted:**

- **Configuration files**: Main config (`dpp.lua` or `dpp.vim`), TypeScript config (`dpp.ts`), and TOML files (`dpp.toml`)
- **Cache directory**: `~/.cache/dpp/` (entire directory)
- **Profile**: Profile entry from global configuration

**Examples:**

```bash
# Clean with confirmation prompt
dpp-cli clean

# Clean specific profile
dpp-cli clean --profile my-profile

# Clean without confirmation (useful for scripts)
dpp-cli clean --force
```

**Note:** In non-interactive mode (e.g., CI/CD), the `--force` flag is required.

## Requirements

- **Deno** 2.0 or later
- **Vim** 9.0+ or **Neovim** 0.9+
- **Git** for cloning plugins
- **denops.vim** (automatically installed by dpp.vim)

## Development

### Running Tests

```bash
deno test --allow-read --allow-write --allow-env --allow-run --allow-net
```

### Building

```bash
deno compile --allow-read --allow-write --allow-env --allow-run --allow-net -o dpp-cli main.ts
```

## Contributing

Contributions are welcome!

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [dpp.vim](https://github.com/Shougo/dpp.vim) - Dark powered plugin manager
- [sheldon](https://github.com/rossmacarthur/sheldon) - Inspiration for this CLI tool
- [denops.vim](https://github.com/vim-denops/denops.vim) - Ecosystem for Vim/Neovim plugins

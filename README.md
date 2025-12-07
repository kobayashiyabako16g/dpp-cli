# dpp-cli

A modern CLI tool for managing [dpp.vim](https://github.com/Shougo/dpp.vim) plugins with type safety and ease of use.

## Features

- 🎯 **Type-safe configuration** - Leverage TypeScript types from dpp.vim
- 📝 **Multiple formats** - Support for TypeScript, TOML, Lua, and Vim script
- 🚀 **Easy initialization** - Quick setup with minimal or scaffold templates
- 🔄 **Migration support** - Migrate from dein, vim-plug, or packer
- 🩺 **Environment diagnostics** - Check your setup with `dpp doctor`
- ✅ **Configuration validation** - Verify your config with `dpp check`

## Installation

### Using Deno

```bash
deno install --allow-read --allow-write --allow-env --allow-run --allow-net -n dpp https://raw.githubusercontent.com/yourusername/dpp-cli/main/main.ts
```

### From Source

```bash
git clone https://github.com/yourusername/dpp-cli.git
cd dpp-cli
deno install --allow-read --allow-write --allow-env --allow-run --allow-net -n dpp main.ts
```

## Quick Start

### 1. Initialize a new configuration

```bash
# TypeScript configuration for Neovim (recommended)
dpp init -f ts -t minimal -e nvim

# TOML configuration
dpp init -f toml -t scaffold -e nvim

# Lua configuration for Neovim
dpp init -f lua -t minimal -e nvim

# Vim script for Vim
dpp init -f vim -t minimal -e vim
```

### 2. Add plugins

```bash
# Add a plugin
dpp add Shougo/ddu.vim

# Add with lazy loading
dpp add Shougo/ddc.vim --on-cmd Ddc

# Add to specific TOML file
dpp add Shougo/ddu-ui-ff -t plugins/ui.toml
```

### 3. Remove plugins

```bash
dpp remove Shougo/ddu-ui-ff
```

### 4. Check configuration

```bash
# Basic check
dpp check

# Strict mode
dpp check --strict
```

### 5. Diagnose environment

```bash
dpp doctor
```

## Commands

### `dpp init`

Initialize a new dpp.vim configuration.

**Options:**
- `-f, --format <ts|toml|lua|vim>` - Configuration file format (default: ts)
- `-t, --template <minimal|scaffold>` - Template type (default: minimal)
- `-e, --editor <vim|nvim>` - Target editor (default: nvim)
- `-p, --profile <name>` - Profile name (default: default)

**Example:**
```bash
dpp init -f ts -t scaffold -e nvim
```

### `dpp add`

Add a plugin to your configuration.

**Arguments:**
- `<repo>` - Plugin repository (e.g., Shougo/ddu.vim)

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
# Simple add
dpp add Shougo/ddu.vim

# With lazy loading
dpp add Shougo/ddc.vim --on-event InsertEnter

# With dependencies
dpp add Shougo/ddu-ui-ff --depends denops.vim
```

### `dpp remove`

Remove a plugin from your configuration.

**Arguments:**
- `<repo>` - Plugin repository to remove

**Example:**
```bash
dpp remove Shougo/ddu-ui-ff
```

### `dpp update`

Update plugins (delegates to dpp.vim).

**Options:**
- `--all` - Update all plugins
- `--parallel <n>` - Number of parallel updates (default: 4)
- `--dry-run` - Show what would be updated

**Examples:**
```bash
# Update all plugins
dpp update --all

# Update specific plugins
dpp update Shougo/ddu.vim Shougo/ddc.vim
```

### `dpp check`

Check configuration validity.

**Options:**
- `--strict` - Enable strict checking
- `-e, --editor <vim|nvim>` - Target editor
- `-p, --profile <name>` - Profile to check

**Example:**
```bash
dpp check --strict
```

### `dpp migrate`

Migrate from other plugin managers.

**Arguments:**
- `--from <dein|vim-plug|packer>` - Plugin manager to migrate from

**Options:**
- `-c, --config <path>` - Source configuration file
- `--dry-run` - Show conversion without creating files
- `-f, --format <ts|toml|lua|vim>` - Output format (default: ts)

**Examples:**
```bash
# Migrate from dein
dpp migrate --from dein --dry-run

# Migrate from vim-plug with specific config
dpp migrate --from vim-plug -c ~/.vimrc -f toml
```

### `dpp doctor`

Diagnose environment and detect issues.

**Options:**
- `-p, --profile <name>` - Profile to check

**Example:**
```bash
dpp doctor
```

## Configuration Formats

### TypeScript (Recommended for Neovim)

```typescript
// ~/.config/nvim/dpp.ts
import type { Plugin } from "jsr:@shougo/dpp-vim/types";

export const config = {
  plugins: [
    { repo: "Shougo/dpp.vim" },
    { repo: "vim-denops/denops.vim" },
    {
      repo: "Shougo/ddu.vim",
      on_cmd: ["Ddu"],
      depends: ["denops.vim"],
    },
  ] satisfies Plugin[],
};
```

### TOML

```toml
# ~/.config/nvim/dpp.toml
[[plugins]]
repo = "Shougo/dpp.vim"

[[plugins]]
repo = "vim-denops/denops.vim"

[[plugins]]
repo = "Shougo/ddu.vim"
on_cmd = ["Ddu"]
depends = ["denops.vim"]
```

### Lua (Neovim)

```lua
-- ~/.config/nvim/dpp.lua
return {
  plugins = {
    { repo = "Shougo/dpp.vim" },
    { repo = "vim-denops/denops.vim" },
    {
      repo = "Shougo/ddu.vim",
      on_cmd = { "Ddu" },
      depends = { "denops.vim" },
    },
  },
}
```

### Vim Script (Vim)

```vim
" ~/.config/vim/dpp.vim
let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'

if !isdirectory(s:dpp_src)
  execute '!git clone https://github.com/Shougo/dpp.vim' s:dpp_src
endif

execute 'set runtimepath^=' .. s:dpp_src

call dpp#begin(s:dpp_base)

call dpp#add('Shougo/dpp.vim')
call dpp#add('vim-denops/denops.vim')
call dpp#add('Shougo/ddu.vim', {
\   'on_cmd': ['Ddu'],
\   'depends': ['denops.vim'],
\ })

call dpp#end()
```

## Templates

### Minimal Template

Includes only essential plugins:
- `Shougo/dpp.vim` - The plugin manager itself
- `vim-denops/denops.vim` - Required for dpp.vim

### Scaffold Template

Includes additional recommended plugins:
- Core dpp.vim plugins
- Extension plugins (installer, lazy loader, git protocol)
- Example plugins (ddu.vim, ddc.vim) with lazy loading

## Profiles

dpp-cli supports multiple profiles for different configurations.

```bash
# Create a work profile
dpp init -f ts -t minimal -e nvim --profile work

# Add plugins to work profile
dpp add Shougo/ddu.vim -p work

# Check work profile
dpp check -p work
```

Profiles are stored in `~/.config/dpp-cli/config.json`.

## Directory Structure

```
~/.config/
├── dpp-cli/
│   └── config.json         # Profile configuration
├── nvim/                   # Neovim configuration
│   ├── dpp.ts             # Main config (TypeScript)
│   ├── dpp.toml           # Or TOML config
│   └── dpp.lua            # Or Lua config
└── vim/                    # Vim configuration
    └── dpp.vim            # Vim script config

~/.cache/dpp/              # Plugin cache (managed by dpp.vim)
└── repos/
    └── github.com/
        └── Shougo/
            └── dpp.vim/
```

## Requirements

- **Deno** 2.0 or later
- **Vim** 9.0+ or **Neovim** 0.9+
- **Git** for cloning plugins
- **denops.vim** (automatically installed by dpp.vim)

## Troubleshooting

### Check your environment

```bash
dpp doctor
```

This will check:
- Deno installation and version
- Vim/Neovim installation and version
- Git installation
- dpp.vim installation
- Configuration files
- Network connectivity

### Validate configuration

```bash
dpp check --strict
```

This will check:
- Configuration file syntax
- Editor compatibility
- TOML file validity
- Type correctness (for TypeScript)

### Common Issues

**Q: "No profile found" error**

A: Run `dpp init` first to create a profile.

**Q: Plugins not loading**

A: Make sure dpp.vim is properly configured in your init.vim/init.lua. See [dpp.vim documentation](https://github.com/Shougo/dpp.vim).

**Q: TypeScript config not working**

A: Ensure Deno is installed and dpp.vim is configured to use TypeScript configs.

## Development

### Running Tests

```bash
deno test --allow-read --allow-write --allow-env --allow-run --allow-net
```

### Building

```bash
deno compile --allow-read --allow-write --allow-env --allow-run --allow-net -o dpp main.ts
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Related Projects

- [dpp.vim](https://github.com/Shougo/dpp.vim) - Dark powered plugin manager
- [sheldon](https://github.com/rossmacarthur/sheldon) - Inspiration for this CLI tool
- [denops.vim](https://github.com/vim-denops/denops.vim) - Ecosystem for Vim/Neovim plugins

## Acknowledgments

- [Shougo](https://github.com/Shougo) for creating dpp.vim
- [Ross MacArthur](https://github.com/rossmacarthur) for sheldon's design inspiration

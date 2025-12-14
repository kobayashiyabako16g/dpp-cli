# dpp-cli

A modern CLI tool for managing [dpp.vim](https://github.com/Shougo/dpp.vim) plugins with type safety and ease of use.

## Features

- 🎯 **Type-safe configuration** - Leverage TypeScript types from dpp.vim
- 📝 **Multiple formats** - Support for TypeScript, TOML, Lua, and Vim script
- � **Unified plugin management** - All formats use TOML for plugin definitions
- �🚀 **Easy initialization** - Quick setup with minimal or scaffold templates

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

All plugins are managed in `dpp.toml` regardless of your configuration format:

```bash
# Add a plugin
dpp add Shougo/ddu.vim

# Add with lazy loading
dpp add Shougo/ddc.vim --on-cmd Ddc

# Add with dependencies
dpp add Shougo/ddu-ui-ff --depends denops.vim
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

### `dpp doctor`

Diagnose environment and detect issues.

**Options:**
- `-p, --profile <name>` - Profile to check

**Example:**
```bash
dpp doctor
```

## Configuration Formats

### How It Works

**All configuration formats use `dpp.toml` for plugin management.** Your main config file (TypeScript/Lua/Vim) serves as a bootstrap that loads plugins from `dpp.toml`.

### TypeScript (Recommended for Neovim)

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

### TOML (Plugin Definitions)

This file is used by **all** configuration formats:

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

### Lua (Neovim)

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

### Vim Script (Vim)

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
│   ├── dpp.ts             # Bootstrap (TypeScript)
│   ├── dpp.lua            # Or bootstrap (Lua)
│   └── dpp.toml           # Plugin definitions (always present)
└── vim/                    # Vim configuration
    ├── dpp.vim            # Bootstrap (Vim script)
    └── dpp.toml           # Plugin definitions (always present)

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

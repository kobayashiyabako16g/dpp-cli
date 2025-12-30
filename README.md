# dpp-cli

A modern CLI tool for managing [dpp.vim](https://github.com/Shougo/dpp.vim) plugins with type safety and ease of use.

## Features

- 🎯 **Type-safe configuration** - TypeScript config for loading TOML plugins
- 📝 **Editor-specific setup** - Lua for Neovim, Vim script for Vim
- 🔌 **Unified plugin management** - All plugins managed in dpp.toml
- 🚀 **Easy initialization** - Quick setup with minimal or scaffold templates

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
# Neovim (creates Lua + TOML + TypeScript config)
dpp init -t minimal -e nvim

# Vim (creates Vim script + TOML + TypeScript config)
dpp init -t minimal -e vim

# Scaffold template with more features
dpp init -t scaffold -e nvim
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

### 4. Clean up configuration

```bash
# Remove all configuration files, cache, and profile
dpp clean

# Skip confirmation prompt
dpp clean --force
```

## Commands

### `dpp init`

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
dpp init -t scaffold -e nvim
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

### `dpp clean`

Remove all dpp configuration files, cache directory, and profile.

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
dpp clean

# Clean specific profile
dpp clean --profile my-profile

# Clean without confirmation (useful for scripts)
dpp clean --force
```

**Note:** In non-interactive mode (e.g., CI/CD), the `--force` flag is required.

## Configuration Formats

### How It Works

**All configurations use three files:**

1. **Main config** (`dpp.lua` or `dpp.vim`) - Bootstrap and runtime configuration
2. **Plugin definitions** (`dpp.toml`) - All plugins managed here
3. **TypeScript loader** (`dpp.ts`) - Loads and processes TOML file

The main config calls `dpp#make_state()` with `dpp.ts`, which reads `dpp.toml` and generates the plugin state.

### Neovim (Lua + TOML + TypeScript)

```lua
-- ~/.config/nvim/dpp.lua
local dpp_base = vim.fn.expand("~/.cache/dpp")
local dpp_src = dpp_base .. "/repos/github.com/Shougo/dpp.vim"
local config_dir = vim.fn.expand("~/.config/nvim")
local dpp_config = config_dir .. "/dpp.ts"

vim.opt.runtimepath:prepend(dpp_src)

if vim.fn["dpp#min#load_state"](dpp_base) == 1 then
  -- Initialize from scratch
  vim.api.nvim_create_autocmd("User", {
    pattern = "DenopsReady",
    callback = function()
      vim.fn["dpp#make_state"](dpp_base, dpp_config)
    end,
  })
end
```

### Vim (Vim script + TOML + TypeScript)

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

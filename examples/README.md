# Example Configurations

This directory contains example configurations for different use cases.

## How It Works

**All configuration formats use `dpp.toml` for plugin management.** Your main config file (TypeScript/Lua/Vim) serves as a bootstrap that loads plugins from `dpp.toml`.

## Files

### Bootstrap Files (TypeScript/Lua/Vim)

- `minimal-typescript.ts` - Minimal TypeScript bootstrap for Neovim
- `minimal-lua.lua` - Minimal Lua bootstrap for Neovim
- `minimal-vim.vim` - Minimal Vim script bootstrap for Vim
- `full-typescript.ts` - Full-featured TypeScript bootstrap with lazy loading

### Plugin Definitions (TOML)

- `minimal-toml.toml` - Minimal plugin list (core plugins only)
- `full-toml.toml` - Full-featured plugin list with extensions and common plugins

## Usage

To use these examples, you need **both** a bootstrap file and a TOML file:

### For Neovim with TypeScript

```bash
# Copy bootstrap
cp examples/minimal-typescript.ts ~/.config/nvim/dpp.ts

# Copy plugin definitions
cp examples/minimal-toml.toml ~/.config/nvim/dpp.toml
```

### For Neovim with Lua

```bash
# Copy bootstrap
cp examples/minimal-lua.lua ~/.config/nvim/dpp.lua

# Copy plugin definitions
cp examples/minimal-toml.toml ~/.config/nvim/dpp.toml
```

### For Vim

```bash
# Copy bootstrap
cp examples/minimal-vim.vim ~/.config/vim/dpp.vim

# Copy plugin definitions
cp examples/minimal-toml.toml ~/.config/vim/dpp.toml
```

Or use them as reference when creating your own configuration with `dpp init`.

## Why This Architecture?

This architecture provides several benefits:

1. **Unified Plugin Management** - Add/remove plugins with `dpp add/remove` commands regardless of your config format
2. **Format Flexibility** - Choose your preferred language (TypeScript/Lua/Vim) without sacrificing functionality
3. **Type Safety** - TypeScript users get full type checking and autocomplete
4. **Official Patterns** - Follows dpp.vim's recommended configuration structure

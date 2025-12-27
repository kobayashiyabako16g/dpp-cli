# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Project Overview

This is a modern CLI tool for managing [dpp.vim](https://github.com/Shougo/dpp.vim) plugins with type safety and ease of use. It's built with Deno and provides commands to initialize configurations, add plugins, and remove plugins across different editor environments (Vim and Neovim).

## Development Commands

**Testing and Quality:**

- `deno task test` - Run all tests with required permissions (--allow-read --allow-write --allow-env --allow-run)
- `deno task lint` - Lint code using Deno's linter
- `deno task check` - Type check with TypeScript (checks main.ts and all src files)
- `deno task fmt` - Format code with Deno's formatter

**Build and Release:**

- `deno task build` - Build distribution binary with Deno compile (outputs to ./dist/dpp)

**Development Usage:**

- `deno run --allow-read --allow-write --allow-env --allow-run main.ts init` - Initialize configuration
- `deno run --allow-read --allow-write --allow-env --allow-run main.ts add <repo>` - Add plugin
- `deno run --allow-read --allow-write --allow-env --allow-run main.ts remove <repo>` - Remove plugin

**CLI Commands:**

- `dpp init` - Initialize dpp.vim configuration
  - `-t, --template <minimal|scaffold>` - Template type (default: minimal)
  - `-e, --editor <vim|nvim>` - Target editor (default: nvim)
  - `-p, --path <dir>` - Custom configuration directory
  - `--profile <name>` - Profile name (default: default)
- `dpp add <repo>` - Add a plugin to configuration
  - `--on-cmd <cmd>` - Lazy load on command
  - `--on-ft <filetype>` - Lazy load on filetype
  - `--on-event <event>` - Lazy load on event
  - `--depends <plugins>` - Plugin dependencies (comma-separated)
  - `-b, --branch <name>` - Specify branch
  - `-t, --toml <file>` - Target TOML file
  - `-p, --profile <name>` - Profile to use
- `dpp remove <repo>` - Remove a plugin from configuration

## Architecture Overview

This CLI tool follows a clear separation of concerns:

**Core Components:**

1. **CLI Entry** ([main.ts](main.ts)) - Uses gunshi framework for CLI setup and routing
2. **Command Definitions** ([src/cli.ts](src/cli.ts)) - Main command and subcommand definitions
3. **Command Implementations** ([src/commands/](src/commands/)) - Actual command logic
   - [add.ts](src/commands/add.ts) - Plugin addition logic
   - [init.ts](src/commands/init.ts) - Configuration initialization
   - [remove.ts](src/commands/remove.ts) - Plugin removal logic
4. **Template System** ([src/templates/](src/templates/)) - Eta-based template generation
   - [minimal/](src/templates/minimal/) - Minimal templates (lua, toml, ts, vim)
   - [scaffold/](src/templates/scaffold/) - Full-featured templates
5. **Utilities** ([src/utils/](src/utils/)) - Shared functionality
   - Configuration handling
   - Editor detection
   - File system operations
   - TOML parsing

**Key Data Flow:**

1. User runs CLI command → gunshi parses and routes to subcommand
2. Command reads/validates configuration files
3. Template system generates appropriate config files based on editor
4. TOML handler manages plugin definitions
5. File system utilities handle file operations

**Configuration Structure:**

- **Neovim**: `dpp.lua` (main config) + `dpp.toml` (plugins) + `dpp.ts` (TypeScript loader)
- **Vim**: `dpp.vim` (main config) + `dpp.toml` (plugins) + `dpp.ts` (TypeScript loader)
- All plugins are managed in `dpp.toml` regardless of editor choice

## Git Commit and PR Conventions

**Commit Message Format:**

Follow the Conventional Commits specification:

```
<type>: <subject>
```

**Type Prefixes:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `test:` - Adding missing tests or correcting existing tests
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Build process or auxiliary tool changes

**Examples:**

```
feat: add JSON configuration support
fix: handle empty TOML files correctly
docs: update installation instructions
test: add integration tests for add command
refactor: extract template generation logic
style: format code with deno fmt
chore: update dependencies to latest versions
```

**PR Title Convention:**

PR titles should follow the same format as commit messages. The title should describe the main change:

```
feat: implement plugin dependency resolution
fix: resolve TOML parsing error with nested tables
docs: comprehensive command documentation update
```

## Code Style Notes

**Formatting:**

- Uses Deno's formatter with the following settings:
  - No tabs (spaces: 2)
  - Line width: 80
  - Semicolons: required
  - Double quotes (not single quotes)
  - Preserve prose wrap
- Run `deno fmt` to format code automatically

**TypeScript Guidelines:**

- TypeScript with strict type checking enabled
- Use bundler module resolution
- Export types when they're used externally
- Use descriptive variable names
- Keep functions small and focused
- Use async/await for asynchronous code

**Naming Conventions:**

- Variables: camelCase - e.g., `configPath`, `pluginRepo`
- Types/Interfaces: PascalCase - e.g., `PluginConfig`, `InitOptions`
- Constants: UPPER_SNAKE_CASE (when appropriate) - e.g., `DEFAULT_EDITOR`
- Files: kebab-case or snake_case - e.g., `config-handler.ts`, `template_test.ts`

**Import Conventions:**

- Use JSR imports for Deno standard library: `@std/path`, `@std/fs`, etc.
- Use proper import maps defined in deno.json
- Group imports logically (external, internal, types)

**Error Handling:**

- Provide helpful error messages with context
- Suggest solutions when possible
- Use try-catch for file operations
- Throw descriptive errors

**Good:**
```typescript
if (!await exists(configPath)) {
  throw new Error(
    `Configuration file not found: ${configPath}\n` +
    `Run 'dpp init' to create a configuration.`
  );
}
```

**Avoid:**
```typescript
if (!await exists(configPath)) {
  throw new Error("File not found");
}
```

**Testing:**

- Test files located in `tests/` directory
- Use descriptive test names
- Test edge cases and error conditions
- Clean up temporary files in tests
- Run tests with appropriate permissions

**Post-Code Change Workflow:**

After making any code changes, ALWAYS run these commands:

- `deno task fmt` - Format code
- `deno task lint` - Lint code
- `deno task check` - Type check
- `deno task test` - Run all tests

This ensures code quality and catches issues immediately after changes.

## Dependencies

All dependencies are managed through Deno's import maps in [deno.json](deno.json):

## Key Implementation Details

**Template System:**

- Uses Eta template engine for generating config files
- Separate templates for minimal and scaffold modes
- Templates are editor-specific (Lua for Neovim, Vim script for Vim)
- TypeScript config loader is common across editors

**TOML Management:**

- All plugins are defined in `dpp.toml`
- TOML parsing handled by `@std/toml`
- Plugin metadata includes: repo, lazy loading options, dependencies, etc.

**Editor Support:**

- Detects editor type (vim/nvim) for appropriate template generation
- Generates editor-specific configuration files
- Common TOML and TypeScript files across both editors

**Global Configuration:**

- Stores user preferences and default settings
- Located in user's config directory
- Manages profiles for different plugin setups

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the user.
When adding code, ensure it follows the existing code style and patterns in the project.
Always run the post-code change workflow (fmt, lint, check, test) after making changes.
Use proper Deno permissions when running commands (--allow-read, --allow-write, --allow-env, --allow-run).

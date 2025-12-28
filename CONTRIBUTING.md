# Contributing to dpp-cli

Thank you for your interest in contributing to dpp-cli! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to make dpp-cli better.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** - Brief description of the problem
2. **Steps to reproduce** - How to reproduce the issue
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Environment** - OS, Deno version, Vim/Neovim version
6. **Config** - Your dpp-cli configuration (if relevant)

**Example:**

```markdown
## Bug: `dpp add` fails with TOML format

### Steps to Reproduce

1. Run `dpp init -f toml`
2. Run `dpp add Shougo/ddu.vim`

### Expected

Plugin should be added to dpp.toml

### Actual

Error: "Cannot read property 'plugins'"

### Environment

- OS: macOS 14.0
- Deno: 2.0.0
- Neovim: 0.10.0
```

### Suggesting Features

For feature requests, create an issue with:

1. **Use case** - Why this feature is needed
2. **Proposed solution** - How it should work
3. **Alternatives** - Other solutions you've considered

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a branch** - Use a descriptive name
   ```bash
   git checkout -b feature/add-json-support
   ```
3. **Make your changes**
4. **Add tests** - Ensure your changes are tested
5. **Run tests** - Make sure all tests pass
   ```bash
   deno test --allow-all
   ```
6. **Format code** - Use Deno's formatter
   ```bash
   deno fmt
   ```
7. **Lint code** - Check for issues
   ```bash
   deno lint
   ```
8. **Commit** - Use clear, descriptive commit messages
   ```bash
   git commit -m "feat: add JSON configuration support"
   ```
9. **Push** - Push to your fork
   ```bash
   git push origin feature/add-json-support
   ```
10. **Create PR** - Submit a pull request

## Development Setup

### Prerequisites

- Deno 2.0 or later
- Git
- Vim or Neovim (for testing)

### Clone and Install

```bash
git clone https://github.com/yourusername/dpp-cli.git
cd dpp-cli
deno install --allow-all -n dpp-dev main.ts
```

### Running Tests

```bash
# Run all tests
deno test --allow-all

# Run specific test file
deno test --allow-all tests/integration_test.ts

# Run with watch mode
deno test --allow-all --watch
```

### Project Structure

```
dpp-cli/
├── main.ts                 # Entry point
├── src/
│   ├── cli.ts             # CLI setup
│   ├── commands/          # Command implementations
│   ├── templates/         # Template generators
│   ├── types/             # Type definitions
│   └── utils/             # Utility functions
└── tests/                 # Test files
```

## Coding Guidelines

### TypeScript Style

- Use TypeScript for all source files
- Enable strict type checking
- Export types when they're used externally
- Use descriptive variable names

**Good:**

```typescript
export interface PluginConfig {
  repo: string;
  onCmd?: string[];
  depends?: string[];
}

async function addPluginToConfig(plugin: PluginConfig): Promise<void> {
  // Implementation
}
```

**Avoid:**

```typescript
function add(p: any) {
  // Implementation
}
```

### Function Guidelines

- Keep functions small and focused
- Use async/await for asynchronous code
- Handle errors appropriately
- Document complex logic

```typescript
/**
 * Parses a TOML configuration file and extracts plugin definitions
 * @param filePath - Absolute path to the TOML file
 * @returns Array of plugin configurations
 * @throws {Error} If file cannot be read or parsed
 */
export async function parseTomlConfig(
  filePath: string,
): Promise<PluginConfig[]> {
  try {
    const content = await Deno.readTextFile(filePath);
    const parsed = parse(content);
    return extracted.plugins || [];
  } catch (error) {
    throw new Error(`Failed to parse TOML config: ${error.message}`);
  }
}
```

### Error Handling

- Provide helpful error messages
- Include context in errors
- Suggest solutions when possible

**Good:**

```typescript
if (!await exists(configPath)) {
  throw new Error(
    `Configuration file not found: ${configPath}\n` +
      `Run 'dpp init' to create a configuration.`,
  );
}
```

**Avoid:**

```typescript
if (!await exists(configPath)) {
  throw new Error("File not found");
}
```

### Testing

- Write tests for new features
- Test edge cases
- Use descriptive test names

```typescript
Deno.test({
  name: "addPluginToToml - adds plugin to existing TOML file",
  async fn() {
    // Setup
    const tempDir = await Deno.makeTempDir();
    const tomlPath = join(tempDir, "dpp.toml");
    await Deno.writeTextFile(
      tomlPath,
      '[[plugins]]\nrepo = "Shougo/dpp.vim"\n',
    );

    // Execute
    await addPluginToToml(tomlPath, { repo: "Shougo/ddu.vim" });

    // Verify
    const content = await Deno.readTextFile(tomlPath);
    assertEquals(content.includes("Shougo/ddu.vim"), true);

    // Cleanup
    await Deno.remove(tempDir, { recursive: true });
  },
});
```

## Commit Message Format

Use conventional commits for clear history:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or changes
- `refactor:` - Code refactoring
- `style:` - Code style changes (formatting, etc.)
- `chore:` - Build process or auxiliary tool changes

**Examples:**

```
feat: add JSON configuration support
fix: handle empty TOML files correctly
docs: update installation instructions
test: add integration tests for migrate command
refactor: extract template generation logic
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for exported functions
- Update plan01.md for architectural changes
- Include examples in documentation

## Questions?

If you have questions about contributing:

1. Check existing issues and PRs
2. Read the documentation in `plan01.md`
3. Create a discussion or issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

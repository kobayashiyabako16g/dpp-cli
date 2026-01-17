// Constants for dpp-cli

// Supported configuration formats
export const SUPPORTED_FORMATS = ["ts", "toml", "lua", "vim"] as const;
export type ConfigFormat = typeof SUPPORTED_FORMATS[number];

// Supported editors
export const SUPPORTED_EDITORS = ["vim", "nvim"] as const;
export type EditorType = typeof SUPPORTED_EDITORS[number];

// Supported template types
export const SUPPORTED_TEMPLATES = ["minimal", "scaffold"] as const;
export type TemplateType = typeof SUPPORTED_TEMPLATES[number];

// Default values
export const DEFAULT_PARALLEL_COUNT = 8;
export const DEFAULT_PROFILE_NAME = "default";
export const DEFAULT_FORMAT: ConfigFormat = "ts";
export const DEFAULT_EDITOR: EditorType = "nvim";
export const DEFAULT_TEMPLATE: TemplateType = "minimal";

// Error messages
export const ERROR_MESSAGES = {
  NO_PROFILE: "No profile found. Run 'dpp init' first.",
  INVALID_EDITOR: (editor: string) =>
    `Invalid editor: ${editor}. Must be one of: ${
      SUPPORTED_EDITORS.join(", ")
    }`,
  INVALID_FORMAT: (format: string) =>
    `Invalid format: ${format}. Must be one of: ${
      SUPPORTED_FORMATS.join(", ")
    }`,
  INVALID_TEMPLATE: (template: string) =>
    `Invalid template: ${template}. Must be one of: ${
      SUPPORTED_TEMPLATES.join(", ")
    }`,
  CREATE_DIR_FAILED: (error: unknown) =>
    `Failed to create directories: ${error}`,
  CREATE_FILE_FAILED: (error: unknown) =>
    `Failed to create configuration file: ${error}`,
  READ_FILE_FAILED: (path: string, error: unknown) =>
    `Failed to read file ${path}: ${error}`,
  WRITE_FILE_FAILED: (path: string, error: unknown) =>
    `Failed to write file ${path}: ${error}`,
  PLUGIN_NOT_FOUND: (repo: string) =>
    `Plugin ${repo} not found in configuration`,
  INVALID_REPO_FORMAT: (repo: string) =>
    `Invalid repository format: "${repo}"

Supported formats:
  - owner/repo (e.g., Shougo/ddu.vim)
  - https://github.com/owner/repo
  - https://github.com/owner/repo.git
  - git@github.com:owner/repo.git

Please provide a valid GitHub repository.`,
  UNSUPPORTED_FORMAT_OPERATION: (format: string, operation: string) =>
    `${operation} for ${format} format is not yet supported. Please manually edit the configuration file.`,
  TOML_NOT_FOUND: (path: string) =>
    `TOML file not found: ${path}\n` +
    `Run 'dpp init' to create a configuration, or check the file path.`,
  EDITOR_LAUNCH_FAILED: (error: unknown) => `Failed to launch editor: ${error}`,
} as const;

// Editor-specific file names
export const INIT_FILE_NAME = {
  nvim: "init.lua",
  vim: "vimrc",
} as const;

// Editor-specific dpp load commands
export const DPP_LOAD_COMMAND = {
  nvim: "require('dpp_config')",
  vim: "source dpp_config.vim",
} as const;

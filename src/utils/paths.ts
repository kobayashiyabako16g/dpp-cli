export interface DppPaths {
  configDir: string; // XDG_CONFIG_HOME/nvim (or vim)
  configFile: string; // XDG_CONFIG_HOME/nvim/lua/dpp_config.lua (or autoload/dpp.vim)
  cacheDir: string; // XDG_CACHE_HOME/dpp
  pluginsDir: string; // XDG_CACHE_HOME/dpp/repos/github.com
  luaDir?: string; // XDG_CONFIG_HOME/nvim/lua (Neovim only)
  autoloadDir?: string; // XDG_CONFIG_HOME/vim/autoload (Vim only)
}

/**
 * Detect vimrc file location following Vim's standard search order
 *
 * @param configDir The Vim configuration directory
 * @returns Path to vimrc file
 */
export function detectVimrc(configDir: string): string {
  const home = Deno.env.get("HOME") || "~";

  // 1. $MYVIMRC (most common for existing Vim users)
  const myVimrc = Deno.env.get("MYVIMRC");
  if (myVimrc) return myVimrc;

  // 2. Standard locations in priority order
  const candidates = [
    `${home}/.vimrc`, // ~/.vimrc (most common)
    `${configDir}/vimrc`, // ~/.vim/vimrc or ~/.config/vim/vimrc
    `${home}/_vimrc`, // ~/_vimrc (Windows)
  ];

  // Return the first existing file, or default to configDir/vimrc
  return candidates.find((p) => {
    try {
      Deno.statSync(p);
      return true;
    } catch {
      return false;
    }
  }) || `${configDir}/vimrc`;
}

/**
 * Detect Neovim init file location following standard search order
 *
 * @param configDir The Neovim configuration directory
 * @returns Path to init.lua or init.vim
 */
export function detectNeovimInit(configDir: string): string {
  // $MYVIMRC can point to init.lua/init.vim for Neovim users
  const myVimrc = Deno.env.get("MYVIMRC");
  if (myVimrc) return myVimrc;

  // Priority order: init.lua > init.vim
  const candidates = [
    `${configDir}/init.lua`,
    `${configDir}/init.vim`,
  ];

  // Return the first existing file, or default to init.lua
  return candidates.find((p) => {
    try {
      Deno.statSync(p);
      return true;
    } catch {
      return false;
    }
  }) || `${configDir}/init.lua`;
}

/**
 * Detect editor initialization file location
 *
 * @param configDir The editor configuration directory
 * @param editor Target editor (vim or nvim)
 * @returns Path to initialization file (vimrc or init.lua/init.vim)
 */
export function detectInitFile(
  configDir: string,
  editor: "vim" | "nvim",
): string {
  return editor === "nvim"
    ? detectNeovimInit(configDir)
    : detectVimrc(configDir);
}

/**
 * Resolve dpp.vim related paths based on options or defaults
 *
 * @param options Optional settings for paths
 * @returns Resolved DppPaths
 */
export function resolveDppPaths(options?: {
  configDir?: string;
  cacheDir?: string;
  format?: string;
  editor?: "vim" | "nvim";
}): DppPaths {
  const home = Deno.env.get("HOME") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") ||
    `${home}/.config`;
  const xdgCacheHome = Deno.env.get("XDG_CACHE_HOME") || `${home}/.cache`;

  const editor = options?.editor || "nvim";
  const configDir = options?.configDir || `${xdgConfigHome}/${editor}`;
  const cacheDir = options?.cacheDir || `${xdgCacheHome}/dpp`;
  const format = options?.format || "ts";

  const paths: DppPaths = {
    configDir,
    configFile: `${configDir}/dpp.${format}`,
    cacheDir,
    pluginsDir: `${cacheDir}/repos/github.com`,
  };

  // Add editor-specific directories
  if (editor === "nvim") {
    paths.luaDir = `${configDir}/lua`;
    // For lua format, place file in lua directory
    if (format === "lua") {
      paths.configFile = `${paths.luaDir}/dpp_config.lua`;
    }
  } else if (editor === "vim") {
    paths.autoloadDir = `${configDir}/autoload`;
    // For vim format, place file in config directory directly
    if (format === "vim") {
      paths.configFile = `${configDir}/dpp_config.vim`;
    }
  }

  return paths;
}

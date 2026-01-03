export interface DppPaths {
  configDir: string; // XDG_CONFIG_HOME/nvim (or vim)
  configFile: string; // XDG_CONFIG_HOME/nvim/lua/dpp_config.lua (or autoload/dpp.vim)
  cacheDir: string; // XDG_CACHE_HOME/dpp
  pluginsDir: string; // XDG_CACHE_HOME/dpp/repos/github.com
  luaDir?: string; // XDG_CONFIG_HOME/nvim/lua (Neovim only)
  autoloadDir?: string; // XDG_CONFIG_HOME/vim/autoload (Vim only)
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
    // For vim format, place file in autoload directory
    if (format === "vim") {
      paths.configFile = `${paths.autoloadDir}/dpp.vim`;
    }
  }

  return paths;
}

export interface DppPaths {
  configDir: string; // XDG_CONFIG_HOME/nvim (or vim)
  configFile: string; // XDG_CONFIG_HOME/nvim/dpp.{format}
  cacheDir: string; // XDG_CACHE_HOME/dpp
  pluginsDir: string; // XDG_CACHE_HOME/dpp/repos/github.com
}

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

  return {
    configDir,
    configFile: `${configDir}/dpp.${format}`,
    cacheDir,
    pluginsDir: `${cacheDir}/repos/github.com`,
  };
}

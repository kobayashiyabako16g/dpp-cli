import { join } from "@std/path";
import type { GlobalConfig, Profile, TomlFileEntry } from "../types/config.ts";
import { createDefaultGlobalConfig } from "../types/config.ts";

export { createDefaultProfile } from "../types/config.ts";

const CONFIG_DIR = "dpp-cli";
const CONFIG_FILE = "config.json";

// Get global configuration file path
export function getGlobalConfigPath(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") ||
    join(home, ".config");
  return join(xdgConfigHome, CONFIG_DIR, CONFIG_FILE);
}

// Load global configuration
export async function loadGlobalConfig(): Promise<GlobalConfig> {
  const configPath = getGlobalConfigPath();

  try {
    const content = await Deno.readTextFile(configPath);
    return JSON.parse(content);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return createDefaultGlobalConfig();
    }
    throw error;
  }
}

// Save global configuration
export async function saveGlobalConfig(
  config: GlobalConfig,
): Promise<void> {
  const configPath = getGlobalConfigPath();
  const configDir = join(configPath, "..");

  await Deno.mkdir(configDir, { recursive: true });
  await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
}

// Get active profile
export async function getActiveProfile(): Promise<Profile | null> {
  const config = await loadGlobalConfig();
  return config.profiles[config.activeProfile] || null;
}

/**
 * Get profile (by name or active)
 * @param name - Profile name (optional)
 * @returns Profile or null if not found
 */
export async function getProfile(name?: string): Promise<Profile | null> {
  if (!name) {
    return await getActiveProfile();
  }

  const config = await loadGlobalConfig();
  return config.profiles[name] || null;
}

// Save profile
export async function saveProfile(profile: Profile): Promise<void> {
  const config = await loadGlobalConfig();

  config.profiles[profile.name] = {
    ...profile,
    lastModified: new Date().toISOString(),
  };

  // Set as active if this is the first profile
  if (Object.keys(config.profiles).length === 1) {
    config.activeProfile = profile.name;
  }

  await saveGlobalConfig(config);
}

// Detect TOML files and add them to the profile
export async function detectAndAddTomlFiles(
  profile: Profile,
): Promise<TomlFileEntry[]> {
  const tomlFiles: TomlFileEntry[] = [];

  try {
    for await (const entry of Deno.readDir(profile.configDir)) {
      if (entry.isFile && entry.name.endsWith(".toml")) {
        tomlFiles.push({
          path: join(profile.configDir, entry.name),
          relativePath: entry.name,
        });
      }
    }

    // Also search plugins/ directory
    const pluginsDir = join(profile.configDir, "plugins");
    try {
      for await (const entry of Deno.readDir(pluginsDir)) {
        if (entry.isFile && entry.name.endsWith(".toml")) {
          tomlFiles.push({
            path: join(pluginsDir, entry.name),
            relativePath: join("plugins", entry.name),
          });
        }
      }
    } catch {
      // Skip if plugins/ directory doesn't exist
    }
  } catch (error) {
    console.error("Error detecting TOML files:", error);
  }

  return tomlFiles;
}

// Get target TOML file (specified or profile's default)
export async function getTargetToml(
  specifiedToml?: string,
  profile?: Profile,
): Promise<string> {
  const activeProfile = profile || await getActiveProfile();

  if (!activeProfile) {
    throw new Error("No active profile found. Run 'dpp init' first.");
  }

  // Use specified TOML if --toml flag is provided
  if (specifiedToml) {
    return join(activeProfile.configDir, specifiedToml);
  }

  // Use defaultToml if it's configured
  if (activeProfile.defaultToml) {
    return activeProfile.defaultToml;
  }

  // Use the TOML file if there's only one
  if (activeProfile.tomlFiles.length === 1) {
    return activeProfile.tomlFiles[0].path;
  }

  // Error if there are multiple files
  if (activeProfile.tomlFiles.length > 1) {
    throw new Error(
      `Multiple TOML files found. Please specify with --toml option:\n${
        activeProfile.tomlFiles.map((f) => `  - ${f.relativePath}`).join("\n")
      }`,
    );
  }

  // Use default if no TOML files exist
  return join(activeProfile.configDir, "dpp.toml");
}

/**
 * Delete a profile from global configuration
 * @param name - Profile name to delete
 * @throws Error if profile not found
 */
export async function deleteProfile(name: string): Promise<void> {
  const config = await loadGlobalConfig();

  // Check if profile exists
  if (!config.profiles[name]) {
    throw new Error(`Profile "${name}" not found`);
  }

  // Delete the profile
  delete config.profiles[name];

  // Handle activeProfile if deleting the active profile
  if (config.activeProfile === name) {
    const remainingProfiles = Object.keys(config.profiles);
    if (remainingProfiles.length > 0) {
      // Set first remaining profile as active
      config.activeProfile = remainingProfiles[0];
    } else {
      // No profiles remain, set to default
      config.activeProfile = "default";
    }
  }

  // If no profiles remain, delete the entire config file
  if (Object.keys(config.profiles).length === 0) {
    const configPath = getGlobalConfigPath();
    try {
      await Deno.remove(configPath);
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }
  } else {
    // Save updated config
    await saveGlobalConfig(config);
  }
}

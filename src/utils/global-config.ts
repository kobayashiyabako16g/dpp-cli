import { join } from "@std/path";
import type { GlobalConfig, Profile, TomlFileEntry } from "../types/config.ts";
import { createDefaultGlobalConfig } from "../types/config.ts";

export { createDefaultProfile } from "../types/config.ts";

const CONFIG_DIR = "dpp-cli";
const CONFIG_FILE = "config.json";

// グローバル設定ファイルのパスを取得
export function getGlobalConfigPath(): string {
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "~";
  const xdgConfigHome = Deno.env.get("XDG_CONFIG_HOME") ||
    join(home, ".config");
  return join(xdgConfigHome, CONFIG_DIR, CONFIG_FILE);
}

// グローバル設定を読み込む
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

// グローバル設定を保存
export async function saveGlobalConfig(
  config: GlobalConfig,
): Promise<void> {
  const configPath = getGlobalConfigPath();
  const configDir = join(configPath, "..");

  await Deno.mkdir(configDir, { recursive: true });
  await Deno.writeTextFile(configPath, JSON.stringify(config, null, 2));
}

// アクティブプロファイルを取得
export async function getActiveProfile(): Promise<Profile | null> {
  const config = await loadGlobalConfig();
  return config.profiles[config.activeProfile] || null;
}

// プロファイルを取得（名前指定またはアクティブ）
export async function getProfile(name?: string): Promise<Profile | null> {
  if (!name) {
    return await getActiveProfile();
  }

  const config = await loadGlobalConfig();
  return config.profiles[name] || null;
}

// プロファイルを保存
export async function saveProfile(profile: Profile): Promise<void> {
  const config = await loadGlobalConfig();

  config.profiles[profile.name] = {
    ...profile,
    lastModified: new Date().toISOString(),
  };

  // 初めてのプロファイルならアクティブに設定
  if (Object.keys(config.profiles).length === 1) {
    config.activeProfile = profile.name;
  }

  await saveGlobalConfig(config);
}

// TOMLファイルを検出してプロファイルに追加
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

    // plugins/ ディレクトリも検索
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
      // plugins/ ディレクトリがない場合はスキップ
    }
  } catch (error) {
    console.error("Error detecting TOML files:", error);
  }

  return tomlFiles;
}

// デフォルトTOMLファイルを取得（指定またはプロファイルのデフォルト）
export async function getTargetToml(
  specifiedToml?: string,
  profile?: Profile,
): Promise<string> {
  const activeProfile = profile || await getActiveProfile();

  if (!activeProfile) {
    throw new Error("No active profile found. Run 'dpp init' first.");
  }

  // --toml が指定されていればそれを使用
  if (specifiedToml) {
    return join(activeProfile.configDir, specifiedToml);
  }

  // defaultToml が設定されていればそれを使用
  if (activeProfile.defaultToml) {
    return activeProfile.defaultToml;
  }

  // TOMLファイルが1つしかなければそれを使用
  if (activeProfile.tomlFiles.length === 1) {
    return activeProfile.tomlFiles[0].path;
  }

  // 複数ある場合はエラー
  if (activeProfile.tomlFiles.length > 1) {
    throw new Error(
      `Multiple TOML files found. Please specify with --toml option:\n${
        activeProfile.tomlFiles.map((f) => `  - ${f.relativePath}`).join("\n")
      }`,
    );
  }

  // TOMLファイルがない場合はデフォルトを使用
  return join(activeProfile.configDir, "dpp.toml");
}

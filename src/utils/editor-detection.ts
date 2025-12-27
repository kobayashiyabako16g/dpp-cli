import type { EditorType } from "../constants.ts";

export interface EditorDetectionResult {
  vim: boolean;
  nvim: boolean;
  detected: EditorType | null;
  versions?: {
    vim?: string;
    nvim?: string;
  };
}

/**
 * Detect installed editors (vim and nvim) on the system
 * @returns Detection result with available editors and their versions
 */
export async function detectInstalledEditors(): Promise<EditorDetectionResult> {
  const nvimInstalled = await checkCommandExists("nvim");
  const vimInstalled = await checkCommandExists("vim");

  // Priority: nvim > vim
  const detected: EditorType | null = nvimInstalled
    ? "nvim"
    : vimInstalled
    ? "vim"
    : null;

  const result: EditorDetectionResult = {
    vim: vimInstalled,
    nvim: nvimInstalled,
    detected,
  };

  // Get versions for detected editors
  if (nvimInstalled || vimInstalled) {
    result.versions = {};

    if (nvimInstalled) {
      result.versions.nvim = await getEditorVersion("nvim");
    }

    if (vimInstalled) {
      result.versions.vim = await getEditorVersion("vim");
    }
  }

  return result;
}

/**
 * Check if a command exists in the system PATH
 * @param cmd Command name to check
 * @returns True if command exists, false otherwise
 */
async function checkCommandExists(cmd: string): Promise<boolean> {
  const isWindows = Deno.build.os === "windows";
  const whichCmd = isWindows ? "where" : "which";

  try {
    const command = new Deno.Command(whichCmd, {
      args: [cmd],
      stdout: "null",
      stderr: "null",
    });

    const { code } = await command.output();
    return code === 0;
  } catch {
    return false;
  }
}

/**
 * Get version string for an editor
 * @param cmd Editor command (vim or nvim)
 * @returns Version string or undefined if not available
 */
async function getEditorVersion(cmd: string): Promise<string | undefined> {
  try {
    const command = new Deno.Command(cmd, {
      args: ["--version"],
      stdout: "piped",
      stderr: "piped",
    });

    const { stdout } = await command.output();
    const output = new TextDecoder().decode(stdout);

    // Extract version based on editor type
    const match = cmd === "nvim"
      ? output.match(/NVIM v(\d+\.\d+\.\d+)/)
      : output.match(/VIM - Vi IMproved (\d+\.\d+)/);

    return match?.[1];
  } catch {
    return undefined;
  }
}

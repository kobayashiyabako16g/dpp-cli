/**
 * Editor launcher utility for opening files in the user's preferred editor
 */

/**
 * Get the default editor based on the platform
 *
 * @returns Default editor command
 */
function getDefaultEditor(): string {
  const isWindows = Deno.build.os === "windows";
  return isWindows ? "notepad" : "vi";
}

/**
 * Launch the user's preferred editor to edit a file
 *
 * Uses the EDITOR or VISUAL environment variable, falling back to
 * platform-specific defaults (vi on Unix-like systems, notepad on Windows).
 *
 * @param filePath - Absolute path to the file to edit
 */
export async function launchEditor(filePath: string): Promise<void> {
  const editor = Deno.env.get("EDITOR") ||
    Deno.env.get("VISUAL") ||
    getDefaultEditor();

  const command = new Deno.Command(editor, {
    args: [filePath],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  // Ignore exit code - even non-zero exits (e.g., user cancellation) are normal
  await command.output();
}

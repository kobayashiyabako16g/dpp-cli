import { cli } from "gunshi";
import { mainCommand, subCommands } from "./src/cli.ts";

if (import.meta.main) {
  await cli(Deno.args, mainCommand, {
    name: "dpp",
    version: "1.0.1",
    subCommands,
    usageOptionType: true,
    fallbackToEntry: true,
  });
}

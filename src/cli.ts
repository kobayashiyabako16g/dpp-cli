import { define } from "gunshi";
import { initCommand } from "./commands/init.ts";
import { addCommand } from "./commands/add.ts";
import { removeCommand } from "./commands/remove.ts";
import { updateCommand } from "./commands/update.ts";
import { checkCommand } from "./commands/check.ts";
import { doctorCommand } from "./commands/doctor.ts";

export const mainCommand = define({
  name: "dpp",
  description: "Dark powered plugin manager CLI",
  run: (_ctx) => {
    console.log("dpp - Dark powered plugin manager CLI");
    console.log("");
    console.log("Usage: dpp <command> [options]");
    console.log("");
    console.log("Commands:");
    console.log("  init      Initialize dpp.vim configuration");
    console.log("  add       Add a plugin to configuration");
    console.log("  remove    Remove a plugin from configuration");
    console.log("  update    Update plugins (delegates to dpp.vim)");
    console.log("  check     Check configuration file validity");
    console.log("  doctor    Diagnose environment and detect issues");
    console.log("");
    console.log("Run 'dpp <command> --help' for more information on a command.");
  },
});

export const subCommands = {
  init: initCommand,
  add: addCommand,
  remove: removeCommand,
  update: updateCommand,
  check: checkCommand,
  doctor: doctorCommand,
};

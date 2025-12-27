import { define } from "gunshi";
import { initCommand } from "./commands/init.ts";
import { addCommand } from "./commands/add.ts";
import { removeCommand } from "./commands/remove.ts";
import { doctorCommand } from "./commands/doctor.ts";

export const mainCommand = define({
  name: "dpp",
  description: "Dark powered plugin manager CLI",
  run: () => {
    // Show help-style output when no subcommand is provided
    console.log("Dark powered plugin manager CLI");
    console.log("");
    console.log("Commands:");
    console.log("  init      Initialize dpp.vim configuration");
    console.log("  add       Add a plugin to dpp.vim configuration");
    console.log("  remove    Remove a plugin from dpp.vim configuration");
    console.log("  doctor    Diagnose environment and detect issues");
    console.log("");
    console.log('Run "dpp --help" for more information');
  },
  examples: `
  # Initialize dpp.vim with minimal template for Neovim
  $ dpp init -t scaffold -e nvim

  # Add a plugin to the configuration
  $ dpp add -n nerdtree -r https://github.com/preservim/nerdtree.git

  # Remove a plugin from the configuration
  $ dpp remove -n nerdtree
  `,
});

export const subCommands = {
  init: initCommand,
  add: addCommand,
  remove: removeCommand,
  doctor: doctorCommand,
};

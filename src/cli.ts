import { define } from "gunshi";
import { initCommand } from "./commands/init.ts";
import { addCommand } from "./commands/add.ts";
import { removeCommand } from "./commands/remove.ts";
import { doctorCommand } from "./commands/doctor.ts";

export const mainCommand = define({
  name: "dpp",
  description: "Dark powered plugin manager CLI",
  run: (_ctx) => {
    console.log("dpp - Dark powered plugin manager CLI");
    console.log("Run /\"manage --help\" for more information'.");
  },
  examples: `
  # Initialize dpp.vim with minimal template for Neovim
  $ dpp init -t scaffold -e nvim

  # Add a plugin to the configuration
  $ dpp add -n nerdtree -r https://github.com/preservim/nerdtree.git

  # Remove a plugin from the configuration
  $ dpp remove -n nerdtree
  `
});

export const subCommands = {
  init: initCommand,
  add: addCommand,
  remove: removeCommand,
  doctor: doctorCommand,
};

import { define } from "gunshi";
import { initCommand } from "./commands/init.ts";
import { addCommand } from "./commands/add.ts";
import { removeCommand } from "./commands/remove.ts";
import { cleanCommand } from "./commands/clean.ts";

export const mainCommand = define({
  name: "dpp",
  description: "Dark powered plugin manager CLI",
  run: () => {
    // Show help-style output when no subcommand is provided
    console.log(`Dark powered plugin manager CLI

Commands:
  init      Initialize dpp.vim configuration
  add       Add a plugin to dpp.vim configuration
  remove    Remove a plugin from dpp.vim configuration
  clean     Remove all dpp configuration files, cache, and profile

Run "dpp --help" for more information
  `); 
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
  clean: cleanCommand,
};

// Minimal TypeScript configuration for dpp.vim
// This is the simplest possible setup to get dpp.vim working

import type { Plugin } from "jsr:@shougo/dpp-vim/types";

export const config = {
  plugins: [
    // Core dpp.vim - the plugin manager itself
    { repo: "Shougo/dpp.vim" },
    
    // denops.vim - required for dpp.vim to work
    { repo: "vim-denops/denops.vim" },
  ] satisfies Plugin[],
};

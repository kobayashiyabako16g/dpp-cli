// Full-featured TypeScript configuration for dpp.vim
// Includes extensions, lazy loading, and common plugins

import type { Plugin } from "jsr:@shougo/dpp-vim/types";

export const config = {
  plugins: [
    // Core plugins
    { repo: "Shougo/dpp.vim" },
    { repo: "vim-denops/denops.vim" },
    
    // dpp.vim extensions
    { repo: "Shougo/dpp-ext-installer" },
    { repo: "Shougo/dpp-ext-lazy" },
    { repo: "Shougo/dpp-ext-toml" },
    { repo: "Shougo/dpp-protocol-git" },
    
    // UI framework
    {
      repo: "Shougo/ddu.vim",
      on_cmd: ["Ddu"],
      depends: ["denops.vim"],
    },
    { repo: "Shougo/ddu-ui-ff" },
    { repo: "Shougo/ddu-source-file" },
    { repo: "Shougo/ddu-filter-matcher_substring" },
    { repo: "Shougo/ddu-kind-file" },
    
    // Completion
    {
      repo: "Shougo/ddc.vim",
      on_event: ["InsertEnter"],
      depends: ["denops.vim"],
    },
    { repo: "Shougo/ddc-ui-native" },
    { repo: "Shougo/ddc-source-around" },
    { repo: "Shougo/ddc-matcher_head" },
    { repo: "Shougo/ddc-sorter_rank" },
    
    // LSP integration
    {
      repo: "prabirshrestha/vim-lsp",
      on_event: ["BufRead"],
    },
    { repo: "mattn/vim-lsp-settings" },
    
    // Syntax highlighting
    {
      repo: "nvim-treesitter/nvim-treesitter",
      on_event: ["BufRead"],
      build: ":TSUpdate",
    },
    
    // File tree
    {
      repo: "lambdalisue/fern.vim",
      on_cmd: ["Fern"],
    },
    
    // Git integration
    {
      repo: "lewis6991/gitsigns.nvim",
      on_event: ["BufRead"],
    },
    
    // Status line
    {
      repo: "nvim-lualine/lualine.nvim",
      on_event: ["VimEnter"],
    },
    
    // Fuzzy finder
    {
      repo: "nvim-telescope/telescope.nvim",
      on_cmd: ["Telescope"],
      depends: ["nvim-lua/plenary.nvim"],
    },
    { repo: "nvim-lua/plenary.nvim" },
    
    // Color scheme
    {
      repo: "folke/tokyonight.nvim",
      lazy: false,
      priority: 1000,
    },
  ] satisfies Plugin[],
};

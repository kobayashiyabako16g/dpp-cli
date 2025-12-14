-- Minimal Lua configuration for dpp.vim (Neovim)
-- Plugins are managed in dpp.toml

local dpp_base = vim.fn.expand("~/.cache/dpp")
local dpp_src = dpp_base .. "/repos/github.com/Shougo/dpp.vim"
local denops_src = dpp_base .. "/repos/github.com/vim-denops/denops.vim"
local config_dir = vim.fn.expand("~/.config/nvim")

-- Add dpp.vim to runtimepath
vim.opt.runtimepath:prepend(dpp_src)

if vim.fn["dpp#min#load_state"](dpp_base) == 1 then
  -- dpp_base state is not loaded, initialize from scratch
  vim.opt.runtimepath:prepend(denops_src)

  vim.api.nvim_create_autocmd("User", {
    pattern = "DenopsReady",
    callback = function()
      vim.fn["dpp#make_state"](dpp_base, config_dir .. "/dpp.ts")
    end,
  })
end

-- Enable filetype detection, plugins and indentation
vim.cmd("filetype indent plugin on")

-- Enable syntax highlighting
if vim.fn.has("syntax") == 1 then
  vim.cmd("syntax on")
end

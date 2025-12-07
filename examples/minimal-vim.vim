" Minimal Vim script configuration for dpp.vim

let s:dpp_base = expand('~/.cache/dpp')
let s:dpp_src = s:dpp_base .. '/repos/github.com/Shougo/dpp.vim'

if !isdirectory(s:dpp_src)
  execute '!git clone https://github.com/Shougo/dpp.vim' s:dpp_src
endif

execute 'set runtimepath^=' .. s:dpp_src

call dpp#begin(s:dpp_base)

call dpp#add('Shougo/dpp.vim')
call dpp#add('vim-denops/denops.vim')

call dpp#end()

{
  description = "Vim and Neovim development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.deno
            pkgs.vim
            pkgs.neovim
          ];
          
          shellHook = ''
            # 1. Setup local sandbox directory
            export PROJECT_ROOT="$PWD"
            export SANDBOX_DIR="$PROJECT_ROOT/.sandbox"
            mkdir -p "$SANDBOX_DIR"

            # 2. Redirect HOME
            # This forces Vim to look for $HOME/.vimrc and $HOME/.vim inside .sandbox
            # This forces Neovim to look for $HOME/.config/nvim inside .sandbox
            export HOME="$SANDBOX_DIR"

            # 3. Handle XDG Base Directories (Best practice for modern CLI tools)
            # Even if your CLI uses XDG spec, this keeps everything in the sandbox
            export XDG_CONFIG_HOME="$SANDBOX_DIR/.config"
            export XDG_DATA_HOME="$SANDBOX_DIR/.local/share"
            export XDG_STATE_HOME="$SANDBOX_DIR/.local/state"
            export XDG_CACHE_HOME="$SANDBOX_DIR/.cache"
            
            mkdir -p "$XDG_CONFIG_HOME" "$XDG_DATA_HOME"

            # 4. Optional: Neovim specific isolation
            export NVIM_APPNAME="nvim-sandbox"

            echo "======================================================="
            echo "🌐 VIM/NEOVIM DUAL SANDBOX ACTIVE"
            echo "======================================================="
            echo "Home Directory : $HOME"
            echo "Vim Config     : $HOME/.vimrc"
            echo "Neovim Config  : $XDG_CONFIG_HOME/$NVIM_APPNAME"
            echo ""
            echo "Note: Your actual system config is completely hidden."
            echo "To wipe all test data, run: rm -rf .sandbox"
            echo "======================================================="
          '';
        };
        
        packages = {
          deno = pkgs.deno;
          vim = pkgs.vim;
          neovim = pkgs.neovim;
          default = pkgs.neovim;
        };
      }
    );
}

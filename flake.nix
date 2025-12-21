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

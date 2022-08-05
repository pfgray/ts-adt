{
  description = "An Algebraic Data Type generator for Typescript";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = nixpkgs.legacyPackages.${system};
      ts-adt = import ./. pkgs;
      bun = import ./nix/bun system pkgs;
    in {
      devShell = pkgs.mkShell {
        packages = [
          bun
        ];
        shellHook = ''
          ln -s ${ts-adt.build}/libexec/ts-adt/node_modules node_modules
        '';
      };
      packages = {
        bun = bun;
        ts-adt-build = ts-adt.ts-adt-build;
      };
      apps.repl = flake-utils.lib.mkApp {
        drv = pkgs.writeShellScriptBin "repl" ''
          confnix=$(mktemp)
          echo "builtins.getFlake (toString $(git rev-parse --show-toplevel))" >$confnix
          trap "rm $confnix" EXIT
          nix repl $confnix
        '';
      };
    });
}

system: 
  { stdenv, lib, unzip, ... }:
    let
      version = "v0.1.6";
      fixedVersion = if version == "canary" then "canary" else "bun-${version}";
      targets = {
        aarch64-linux = "linux-aarch64";
        x86_64-darwin = "darwin-x64";
        x86_64-linux = "linux-x64";
      };
      target = "darwin-x64";
      zipFilename = "bun-${target}";
      zip = builtins.fetchurl {
        url = "https://github.com/oven-sh/bun/releases/download/${fixedVersion}/${zipFilename}.zip";
        sha256 = "15145vh93z5p30f0whp7fxxl7axkbg7jr28ww7nhf0phnllmzysi";
      };
    in
      stdenv.mkDerivation {
        name = "bun";
        src = ./.;
        buildInputs = [unzip];
        installPhase = builtins.trace (system) ''
          mkdir -p $out
          unzip ${zip} -d $out
          mv $out/${zipFilename} $out/bin
          # cp -R $src $out
        '';
      }
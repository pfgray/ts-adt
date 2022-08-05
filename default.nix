{yarn2nix, mkYarnPackage, ...}:
  let
    foo = "foo";
  in {
    build = mkYarnPackage {
        name = "ts-adt";
        src = ./.;
        packageJSON = ./package.json;
        yarnLock = ./yarn.lock;
    };
  }
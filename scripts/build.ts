import * as path from "path";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as RTE from "fp-ts/lib/ReaderTaskEither";
import * as A from "fp-ts/lib/ReadonlyArray";
import * as TE from "fp-ts/lib/TaskEither";
import { FileSystem, fileSystem } from "./FileSystem";
import { run } from "./run";

interface Build<A> extends RTE.ReaderTaskEither<FileSystem, Error, A> {}

const OUTPUT_FOLDER = "lib";
const PKG = "package.json";

export const copyPackageJson: Build<void> = (C) =>
  pipe(
    C.readFile(PKG),
    TE.chain((s) => TE.fromEither(E.parseJSON(s, E.toError))),
    TE.map((v) => {
      const clone = Object.assign({}, v as any);

      delete clone.scripts;
      delete clone.files;
      delete clone.devDependencies;

      return clone;
    }),
    TE.chain((json) =>
      C.writeFile(path.join(OUTPUT_FOLDER, PKG), JSON.stringify(json, null, 2))
    )
  );

export const FILES: ReadonlyArray<string> = [
  "CHANGELOG.md",
  "LICENSE",
  "README.md",
];

export const copyFiles: Build<void> = (C) =>
  pipe(
    FILES,
    A.traverse(TE.taskEither)((from) =>
      C.copyFile(from, path.resolve(OUTPUT_FOLDER, from))
    ),
    TE.map(() => {})
  );

const traverse = A.traverse(TE.taskEither);

const main: Build<void> = pipe(
  copyPackageJson,
  RTE.chain(() => copyFiles)
);

run(
  main({
    ...fileSystem,
  })
);

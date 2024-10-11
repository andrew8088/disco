import { glob, readFile } from "node:fs/promises";

// const asyncIter = glob("**/*.ts");
//
// for await (const file of asyncIter) {
//   console.log(file);
//   console.log((await readFile(file)).toString());
// }

function readFileToString(filepath: string) {
  return readFile(filepath, "utf8").then((buffer) => buffer.toString());
}

async function* mapAsync<T, U>(iter: AsyncIterable<T>, fn: (value: T) => U) {
  for await (const value of iter) {
    yield fn(value);
  }
}

const pathsAndContents = mapAsync(
  glob("**/*.ts"),
  async (f) => [f, await readFileToString(f)] as const,
);

const contentLength = mapAsync(pathsAndContents, async ([, content]) => content.length);

console.log(await Array.fromAsync(contentLength));

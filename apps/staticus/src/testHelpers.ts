import fs from "node:fs/promises";
import os from "node:os";
import nPath from "node:path";

export function getFixtureDir(dirname: "basic") {
  return nPath.join(__dirname, "..", "fixtures", dirname);
}

export function getTmpDir() {
  return fs.mkdtemp(nPath.join(os.tmpdir(), "staticus-"));
}

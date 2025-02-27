import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as nPath from "node:path";

export function getFixtureDir(dirname: "basic") {
  return nPath.join(__dirname, "..", "fixtures", dirname);
}

export function getTmpDir() {
  return fs.mkdtemp(nPath.join(os.tmpdir(), "staticus-"));
}

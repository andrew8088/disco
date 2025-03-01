import fs from "node:fs/promises";
import nPath from "node:path";
import * as dir from "./util/dir";

type CollectionConfig = {
  src: (config: Config) => AsyncGenerator<dir.File>;
  transform: (config: Config) => (file: dir.File) => dir.File;
};

type Config = {
  baseDir: string;
  output: string;
  collections: Array<CollectionConfig>;
};

export default class Staticus {
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
  }

  async build(): Promise<void> {
    for (const { src, transform } of this.#config.collections) {
      for await (const file of src(this.#config)) {
        const newFile = transform(this.#config)(file);
        await fs.mkdir(nPath.dirname(newFile.path), { recursive: true });
        await fs.writeFile(newFile.path, newFile.content);
      }
    }
  }

  static fromFilesIn(src: string) {
    return (config: Config) => dir.read(nPath.join(config.baseDir, src));
  }

  static passthrough() {
    return (config: Config) => (file: dir.File) => ({
      ...file,
      path: file.path.replace(config.baseDir, config.output),
    });
  }
}

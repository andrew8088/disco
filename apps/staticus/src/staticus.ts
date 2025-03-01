import fs from "node:fs/promises";
import nPath from "node:path";
import markdownit from "markdown-it";
import * as dir from "./util/dir";
import { removeFrontmatter } from "./util/yaml";

type CollectionConfig = {
  src: AsyncGenerator<dir.File>;
  transform: (file: dir.File) => dir.File;
};

type Config = {
  baseDir: string;
  output: string;
  collections: Array<(c: Config) => CollectionConfig>;
};

export default class Staticus {
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
  }

  async build(): Promise<void> {
    for (const c of this.#config.collections) {
      const { src, transform } = c(this.#config);
      for await (const file of src) {
        const newFile = transform(file);
        await fs.mkdir(nPath.dirname(newFile.path), { recursive: true });
        await fs.writeFile(newFile.path, newFile.content);
      }
    }
  }

  static passthrough(src: string): (c: Config) => CollectionConfig {
    return (config: Config) => ({
      src: dir.read(nPath.join(config.baseDir, src)),
      transform: (file: dir.File) => ({
        ...file,
        path: file.path.replace(config.baseDir, config.output),
      }),
    });
  }

  static markdown(src: string): (c: Config) => CollectionConfig {
    const md = markdownit();

    return (config: Config) => ({
      src: dir.read(nPath.join(config.baseDir, src)),
      transform: (file: dir.File) => {
        const content = removeFrontmatter(file.content).trim();
        return {
          content: file.path.endsWith("md") ? md.render(content) : content,
          path: file.path.replace(config.baseDir, config.output).replace(".md", ".html"),
        };
      },
    });
  }
}

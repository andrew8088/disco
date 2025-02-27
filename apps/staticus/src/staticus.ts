import * as dir from "./util/dir";

type Config = {
  src: string;
  dest: string;
};

export default class Staticus {
  #config: Config;
  constructor(config: Config) {
    this.#config = config;
  }

  async build(): Promise<void> {
    await dir.copy(this.#config.src, this.#config.dest);
  }
}

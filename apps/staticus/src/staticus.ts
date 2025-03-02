import { Collection } from "./collection";
export * as collection from "./collection";
export * as reader from "./reader";
export * as transformers from "./transformers";
export * as writer from "./writer";

export type Options = {
  srcDir: string;
  destDir: string;
};

export default function staticus(options: Options, collections: Record<string, Collection>) {
  return {
    async build() {
      for (const collection of Object.values(collections)) {
        await collection.build(options);
      }
    },
  };
}

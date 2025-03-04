import { Collection } from "./collection";

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

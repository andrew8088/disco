import { Collection } from "./collection";
import collection from "./collection";
import * as reader from "./reader";
import * as transformers from "./transformers";
import * as writer from "./writer";

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

staticus.collection = collection;
staticus.reader = reader;
staticus.transformers = transformers;
staticus.writer = writer;

import { Options } from "./staticus";

type CollectionArg<R, T> = {
  reader: (opts: Options) => AsyncIterable<R>;
  transformer: (items: AsyncIterable<R>, opts: Options) => AsyncGenerator<T>;
  writer: (items: AsyncIterable<T>, opts: Options) => Promise<void>;
};

export type Collection = {
  build(opts: Options): Promise<void>;
};

export function collection<R, T>({ reader, transformer, writer }: CollectionArg<R, T>): Collection {
  return {
    async build(opts: Options) {
      await writer(transformer(reader(opts), opts), opts);
    },
  };
}

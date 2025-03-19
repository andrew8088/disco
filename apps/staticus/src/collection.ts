import { StaticusOptions } from "./staticus";

type CollectionArg<R, T> = {
  reader: (opts: StaticusOptions) => AsyncIterable<R>;
  transformer: (items: AsyncIterable<R>, opts: StaticusOptions) => AsyncGenerator<T>;
};

export type Collection<T> = { build: (opts: StaticusOptions) => AsyncGenerator<T> };

export function collection<R, T>({ reader, transformer }: CollectionArg<R, T>): Collection<T> {
  return {
    build(opts: StaticusOptions) {
      return transformer(reader(opts), opts);
    },
  };
}

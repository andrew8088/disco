import { Options } from "./staticus";

export default function collection<R, T>({
  reader,
  transformer,
  writer,
}: {
  reader: (opts: Options) => AsyncIterable<R>;
  transformer: (items: AsyncIterable<R>, opts: Options) => AsyncGenerator<T>;
  writer: (items: AsyncIterable<T>, opts: Options) => Promise<void>;
}) {
  return {
    async build(opts: Options) {
      await writer(transformer(reader(opts), opts), opts);
    },
  };
}

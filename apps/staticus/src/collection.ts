export default function collection<R, T>({
  reader,
  transformer,
  writer,
}: {
  reader: () => AsyncIterable<R>;
  transformer: (item: AsyncIterable<R>) => AsyncIterable<T>;
  writer: (item: T) => void;
}) {
  return {
    async build() {
      for await (const item of transformer(reader())) {
        writer(item);
      }
    },
  };
}

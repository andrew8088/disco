export default function collection<R, T>({
  reader,
  transformer,
  writer,
}: {
  reader: () => AsyncGenerator<R>;
  transformer: (item: R) => T;
  writer: (item: T) => void;
}) {
  return {
    async build() {
      for await (const item of reader()) {
        writer(transformer(item));
      }
    },
  };
}

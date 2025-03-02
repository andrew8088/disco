export type Options = {
  srcDir: string;
  destDir: string;
};

export default function staticus(
  options: Options,
  collections: Record<string, { build: (o: Options) => Promise<void> }>,
) {
  return {
    async build() {
      for (const collection of Object.values(collections)) {
        await collection.build(options);
      }
    },
  };
}

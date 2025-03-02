import type { StandardSchemaV1 } from "@standard-schema/spec";
import { splitFrontmatter } from "./util/yaml";

export type BaseItem = { originalPath: string; originalContent: string };

export async function* yamlFrontMatter<T extends StandardSchemaV1>(
  items: AsyncIterable<BaseItem>,
  schema: T,
): AsyncGenerator<{
  data: StandardSchemaV1.InferOutput<T>;
  content: string;
  originalPath: string;
  originalContent: string;
}> {
  for await (const item of items) {
    const [frontMatter, content] = splitFrontmatter(item.originalContent);
    let result = schema["~standard"].validate(frontMatter);

    if (result instanceof Promise) result = await result;

    if (result.issues) {
      throw new Error(JSON.stringify(result.issues, null, 2));
    }

    yield {
      data: result.value,
      content,
      originalPath: item.originalPath,
      originalContent: item.originalContent,
    };
  }
}

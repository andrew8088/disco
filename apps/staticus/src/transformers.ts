import type { StandardSchemaV1 } from "@standard-schema/spec";
import markdownit from "markdown-it";
import { BaseItem } from "./reader";
import { splitFrontmatter } from "./util/yaml";

export async function* yamlFrontMatter<T extends StandardSchemaV1>(
  items: AsyncIterable<BaseItem>,
  schema: T,
  { required } = { required: true },
): AsyncGenerator<{
  data: StandardSchemaV1.InferOutput<T>;
  content: string;
  originalPath: string;
  originalContent: string;
}> {
  for await (const item of items) {
    const [frontMatter, content] = splitFrontmatter(item.originalContent);

    if (!frontMatter) {
      if (required) {
        throw new Error(`No frontmatter found in ${item.originalPath}`);
      }
      yield {
        data: undefined,
        content,
        originalPath: item.originalPath,
        originalContent: item.originalContent,
      };
      continue;
    }

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

export async function* markdown<T extends { content: string }>(
  items: AsyncIterable<T>,
  md: markdownit,
): AsyncGenerator<T> {
  md ??= markdownit();

  for await (const item of items) {
    yield {
      ...item,
      content: md.render(item.content),
    };
  }
}

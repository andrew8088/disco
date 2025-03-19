import type { StandardSchemaV1 } from "@standard-schema/spec";
import markdownit from "markdown-it";
import * as k from "./kite";
import * as reader from "./reader";
import { splitFrontmatter } from "./util/yaml";

export type StaticusOptions = {
  srcDir: string;
  destDir: string;
  md: markdownit;
};

export async function staticus<T extends Record<string, unknown>>(
  props: {
    [K in keyof T]: AsyncGenerator<T[K]>;
  },
): Promise<{
  [K in keyof T]: Array<T[K]>;
}> {
  const result: Partial<{
    [K in keyof T]: Array<T[K]>;
  }> = {};
  for (const key in props) {
    result[key] = await Array.fromAsync(props[key]);
  }
  return result as {
    [K in keyof T]: Array<T[K]>;
  };
}

export function collection<
  R extends Record<string, unknown>,
  Schema extends StandardSchemaV1<unknown, R>,
>(props: {
  glob: string;
  frontmatter: Schema;
  layout: string;
  data: (item: reader.BaseItem) => Record<string, unknown>;
}) {
  return (config: StaticusOptions) =>
    k.map(reader.glob(props.glob)(config), async (item) => {
      const [_data, content] = splitFrontmatter(item.originalContent);
      const data = await validate(props.frontmatter, _data);
      const extraData = props.data(item);
      const allData = {
        ...data,
        ...extraData,
        layout: props.layout,
      };

      return {
        ...item,
        data: allData,
        content: config.md.render(content),
        outputPath: (data.permalink
          ? `${data.permalink}/index.html`
          : item.originalPath.replace(/\.md$/, "/index.html")
        ).replace("index/index", "index"),
      };
    });
}

async function validate<R extends Record<string, unknown>, T extends StandardSchemaV1<unknown, R>>(
  schema: T,
  data: unknown,
): Promise<StandardSchemaV1.InferOutput<T>> {
  let result = schema["~standard"].validate(data);

  if (result instanceof Promise) result = await result;

  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  return result.value;
}

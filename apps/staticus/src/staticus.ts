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
  options: StaticusOptions,
  props: {
    [K in keyof T]: (o: StaticusOptions) => AsyncGenerator<T[K]>;
  },
): Promise<{
  [K in keyof T]: Array<T[K]>;
}> {
  const result: Partial<{
    [K in keyof T]: Array<T[K]>;
  }> = {};
  for (const key in props) {
    result[key] = await Array.fromAsync(props[key](options));
  }
  return result as {
    [K in keyof T]: Array<T[K]>;
  };
}

// export function collection<
//   R extends Record<string, unknown>,
//   Schema extends StandardSchemaV1<unknown, R>,
//   T extends Record<string, unknown>,
// >(props: {
//   glob: string;
//   exclude?: string[];
//   frontmatter?: Schema;
//   layout?: string;
//   data?: (
//     item: reader.BaseItem & { data: StandardSchemaV1.InferOutput<Schema> },
//   ) => T;
// }): (config: StaticusOptions) => AsyncGenerator<
//   reader.BaseItem & {
//     data: StandardSchemaV1.InferOutput<Schema> &
//       T & { layout: string | undefined };
//     content: string;
//     outputPath: string;
//   },
//   void,
//   unknown
// > {
//   return (config: StaticusOptions) => {
//     return k.map(
//       reader.glob(props.glob, { exclude: props.exclude })(config),
//       async (item) => {
//         const [_data, content] = splitFrontmatter(item.originalContent);
//
//         let data: StandardSchemaV1.InferOutput<Schema> | null = null;
//         let extraData: T | null = null;
//
//         if (props.frontmatter && !props.data && _data) {
//           data = await validate(props.frontmatter, _data);
//         }
//
//         if (props.frontmatter && props.data && _data) {
//           data = await validate(props.frontmatter, _data);
//           extraData = props.data({
//             ...item,
//             data,
//           });
//         }
//
//         if (!props.frontmatter && props.data) {
//           extraData = props.data({
//             ...item,
//             data: {} as StandardSchemaV1.InferOutput<Schema>,
//           });
//         }
//
//         const allData: StandardSchemaV1.InferOutput<Schema> &
//           T & { layout: string | undefined } = {
//           layout: props.layout,
//           ...data,
//           ...extraData,
//         };
//
//         // should we auto-ID markdown & render? or explicit config?
//         // maybe a default + configurable `content` key?
//         return {
//           ...item,
//           data: allData,
//           content: config.md.render(content),
//           outputPath: (data && "permalink" in data
//             ? `${data.permalink}/index.html`
//             : item.originalPath.replace(/\.md$/, "/index.html")
//           ).replace("index/index", "index"),
//         };
//       },
//     );
//   };
// }

async function validate<T extends StandardSchemaV1>(
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

type CollectionFields = {
  glob: string;
  layout?: string;
  exclude?: string[];
};

export class CollectionBuilder<T extends { glob: string } & Partial<CollectionFields>> {
  #state: T = {} as T;

  static create(glob: string) {
    return new CollectionBuilder({ glob });
  }

  private constructor(state: T = {} as T) {
    this.#state = state;
  }

  withExclude(exclude: string[]) {
    return new CollectionBuilder({ ...this.#state, exclude });
  }

  withLayout(layout: string) {
    return new CollectionBuilder({ ...this.#state, layout });
  }

  withFrontmatter<Schema extends StandardSchemaV1>(schema: Schema) {
    return new CollectionWithFrontmatterBuilder<
      T & {
        frontmatter: Schema;
      },
      Schema
    >({
      ...this.#state,
      frontmatter: schema,
    });
  }

  withComputedFields<R>(compute: (item: reader.BaseItem) => R | Promise<R>) {
    return new CollectionWithComputedBuilder<
      T & { compute: (item: reader.BaseItem) => R | Promise<R> },
      R
    >({
      ...this.#state,
      compute,
    });
  }

  build(config: StaticusOptions) {
    const props = this.#state;
    return k.map(reader.glob(props.glob, { exclude: props.exclude })(config), async (item) => {
      const [_data, content] = splitFrontmatter(item.originalContent);

      return {
        ...item,
        data: {
          layout: props.layout,
        },
        content: config.md.render(content),
        outputPath: item.originalPath
          .replace(/\.md$/, "/index.html")
          .replace("index/index", "index"),
      };
    });
  }
}

type CollectionWithFrontmatterFields<Schema extends StandardSchemaV1> = CollectionFields & {
  frontmatter: Schema;
};

class CollectionWithFrontmatterBuilder<
  T extends CollectionWithFrontmatterFields<Schema>,
  Schema extends StandardSchemaV1,
> {
  #state: T = {} as T;

  constructor(state: T) {
    this.#state = state;
  }

  withComputedFields<R extends Record<string, unknown>>(
    compute: (
      item: reader.BaseItem & {
        frontmatter: StandardSchemaV1.InferOutput<Schema>;
      },
    ) => R | Promise<R>,
  ) {
    return new CollectionWithFrontmatterAndComputedBuilder<
      T & {
        compute: (
          item: reader.BaseItem & {
            frontmatter: StandardSchemaV1.InferOutput<Schema>;
          },
        ) => R | Promise<R>;
      },
      Schema,
      R
    >({
      ...this.#state,
      compute,
    });
  }
}

type CollectionWithComputedFields<T> = CollectionFields & {
  compute: (item: reader.BaseItem) => T | Promise<T>;
};

class CollectionWithComputedBuilder<T extends CollectionWithComputedFields<R>, R> {
  #state: T = {} as T;

  constructor(state: T) {
    this.#state = state;
  }

  build(config: StaticusOptions) {
    const props = this.#state;
    return k.map(reader.glob(props.glob, { exclude: props.exclude })(config), async (item) => {
      const [_data, content] = splitFrontmatter(item.originalContent);

      const computed = await props.compute(item);

      const data = {
        layout: props.layout,
        computed,
      };
      // should we auto-ID markdown & render? or explicit config?
      // maybe a default + configurable `content` key?
      return {
        ...item,
        data,
        content: config.md.render(content),
        outputPath: (data && "permalink" in data
          ? `${data.permalink}/index.html`
          : item.originalPath.replace(/\.md$/, "/index.html")
        ).replace("index/index", "index"),
      };
    });
  }
}

type CollectionWithFrontmatterAndComputedFields<
  Schema extends StandardSchemaV1,
  S extends Record<string, unknown>,
> = CollectionFields & {
  frontmatter: Schema;
  compute: (
    item: reader.BaseItem & {
      frontmatter: StandardSchemaV1.InferOutput<Schema>;
    },
  ) => S | Promise<S>;
};

class CollectionWithFrontmatterAndComputedBuilder<
  T extends CollectionWithFrontmatterAndComputedFields<Schema, S>,
  Schema extends StandardSchemaV1,
  S extends Record<string, unknown>,
> {
  #state: T = {} as T;

  constructor(state: T) {
    this.#state = state;
  }

  build(config: StaticusOptions) {
    const props = this.#state;
    return k.map(reader.glob(props.glob, { exclude: props.exclude })(config), async (item) => {
      const [_data, content] = splitFrontmatter(item.originalContent);

      const frontmatter = await validate(props.frontmatter, _data);
      const computed = await props.compute({
        ...item,
        frontmatter,
      });

      const data = {
        layout: props.layout,
        frontmatter,
        computed,
      };

      const permalink =
        frontmatter && typeof frontmatter === "object" && "permalink" in frontmatter
          ? frontmatter.permalink
          : (computed.permalink ?? null);

      // should we auto-ID markdown & render? or explicit config?
      // maybe a default + configurable `content` key?
      return {
        ...item,
        data,
        content: config.md.render(content),
        outputPath: (permalink
          ? `${permalink}/index.html`
          : item.originalPath.replace(/\.md$/, "/index.html")
        ).replace("index/index", "index"),
      };
    });
  }
}

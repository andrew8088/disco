export class SchemaError extends Error {
  readonly errors: ReadonlyArray<string>;

  constructor(errors: string | string[]) {
    if (Array.isArray(errors)) {
      super("value could not be parsed");
      this.errors = errors;
    } else {
      super(errors);
      this.errors = [errors];
    }
  }
}

export function handleError(e: Error, prefix?: string) {
  prefix = prefix ? `${prefix}: ` : "";
  if (e instanceof SchemaError) {
    return e.errors.map((err) => `${prefix}${err}`);
  } else {
    return [`${prefix}${e.message}`];
  }
}

// no, I don't really understand this ...
// source: https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
export type UnionToIntersection<U> = (U extends U ? (x: U) => void : never) extends (x: infer I) => void ? I : never;

// eslint-disable-next-line @typescript-eslint/ban-types
export type FlatType<T> = {} & { [P in keyof T]: T[P] };

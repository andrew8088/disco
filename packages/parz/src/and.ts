import { Parz } from "./types";
import { SchemaError, type UnionToIntersection, type FlatType, handleError } from "./utils";

export default function and<D extends Array<Parz<T>>, T>(parsers: D) {
  return {
    parse(value: unknown): FlatType<UnionToIntersection<{ [K in keyof D]: ReturnType<D[K]["parse"]> }[number]>> {
      const errors = [];
      for (const parser of parsers) {
        try {
          return parser.parse(value) as never;
        } catch (e) {
          errors.push(...handleError(e));
        }
      }

      if (errors.length === 0) {
        return value as never;
      }

      throw new SchemaError(errors);
    },

    mock() {
      const ret = {};
      for (const parser of parsers) {
        Object.assign(ret, parser.mock());
      }
      return ret;
    },
  };
}

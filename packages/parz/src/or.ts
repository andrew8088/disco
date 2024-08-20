import { simpleFaker as faker } from "@faker-js/faker";
import { Parz } from "./types";
import { SchemaError, handleError } from "./utils";

export default function or<D extends Array<Parz<T>>, T>(
  parsers: D,
): Parz<{ [K in keyof D]: ReturnType<D[K]["parse"]> }[number]> {
  return {
    parse(value: unknown): { [K in keyof D]: ReturnType<D[K]["parse"]> }[number] {
      const errors: string[] = [];
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
      const idx = faker.number.int({ min: 0, max: parsers.length - 1 });
      return parsers[idx].mock() as never;
    },
  };
}

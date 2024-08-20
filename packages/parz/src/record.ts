import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError, handleError } from "./utils";
import object from "./object";
import { Parz } from "./types";

export default function record<K extends string | number, V>(
  key: Parz<K>,
  value: Parz<V>,
): Parz<Record<K, V>> {
  return {
    parse(input: unknown): Record<K, V> {
      const errors = [];

      for (const [k, v] of Object.entries(object({}).parse(input))) {
        try {
          key.parse(k);
          value.parse(v);
        } catch (err) {
          errors.push(...handleError(err));
        }
      }

      if (errors.length === 0) {
        return input as never;
      }

      throw new SchemaError(errors);
    },
    mock() {
      const ret = {} as Record<K, V>;
      const count = faker.number.int({ min: 1, max: 10 });
      for (let i = 0; i < count; i++) {
        ret[key.mock()] = value.mock();
      }
      return ret as never;
    },
  };
}

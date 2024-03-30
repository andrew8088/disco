import { Parz } from "./types";
import { SchemaError, handleError } from "./utils";

export default function array<T>(schema: Parz<T>): Parz<T[]> {
  return {
    parse(value: unknown): Array<T> {
      const errors = [];
      if (!Array.isArray(value)) {
        errors.push(`value \`${JSON.stringify(value)}\` is not an array`);
      } else {
        for (let i = 0; i < value.length; i++) {
          try {
            schema.parse(value[i]);
          } catch (e) {
            errors.push(...handleError(e, `index \`${i}\``));
          }
        }
      }
      if (errors.length === 0) {
        return value as never;
      }

      throw new SchemaError(errors);
    },
    mock() {
      const count = faker.number.int({ min: 1, max: 10 });
      return Array.from({ length: count }, () => schema.mock());
    },
  };
}

import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError } from "./utils";

export default function boolean() {
  return {
    parse(value: unknown): boolean {
      if (typeof value === "boolean") {
        return value;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not a boolean`);
    },
    mock() {
      return faker.datatype.boolean();
    },
  };
}

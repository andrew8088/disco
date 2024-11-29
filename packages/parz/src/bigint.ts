import { simpleFaker as faker } from "@faker-js/faker";
import { SchemaError } from "./utils";

export default function bigint() {
  return {
    parse(value: unknown): bigint {
      if (typeof value === "bigint") {
        return value;
      }
      throw new SchemaError(`value \`${JSON.stringify(value)}\` is not a bigint`);
    },
    mock() {
      return faker.number.bigInt();
    },
  };
}

import { Parz, ParzObject } from "./types";
import { SchemaError, handleError } from "./utils";

export default function object<Def extends Record<string, Parz<T>>, T>(definition: Def): ParzObject<Def> {
  return {
    parse(value: unknown): {
      [K in keyof Def]: ReturnType<Def[K]["parse"]>;
    } {
      const errors = [];

      if (typeof value !== "object" || value == null || Array.isArray(value)) {
        errors.push(`value \`${JSON.stringify(value)}\` is not an object`);
      } else {
        for (const k of Object.keys(definition)) {
          if (!(k in value)) {
            errors.push(`key \`${k}\` is missing`);
          } else {
            try {
              definition[k].parse((value as never)[k]);
            } catch (e) {
              errors.push(...handleError(e, `key \`${k}\``));
            }
          }
        }
      }

      if (errors.length === 0) {
        return value as never;
      }

      throw new SchemaError(errors);
    },
    mock() {
      const ret: Record<string, unknown> = {};
      for (const k of Object.keys(definition)) {
        ret[k] = definition[k].mock();
      }
      return ret as never;
    },
    field<K extends keyof Def>(name: K) {
      return definition[name];
    },
  };
}

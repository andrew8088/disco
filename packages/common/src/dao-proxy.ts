type DAO<T extends object> = {
  [K in keyof T as `findBy${Capitalize<K & string>}`]: (value: T[K]) => Promise<T[]>;
} & {
  [K in keyof T as `findOneBy${Capitalize<K & string>}`]: (value: T[K]) => Promise<T>;
};

export function createDao<T extends object>(): DAO<T> {
  return new Proxy<DAO<T>>({} as DAO<T>, {
    get(target, prop, receiver) {
      if (typeof prop === "string") {
        if (prop.startsWith("findBy")) {
          const key = prop.slice(6).toLowerCase();
          return async (value: number) => {
            console.log(`Finding multiple where ${key} = ${value}`);
            return [];
          };
        }

        if (prop.startsWith("findOneBy")) {
          const key = prop.slice(9).toLowerCase();
          return async (value: T[keyof T]) => {
            console.log(`Finding one where ${key} = ${value}`);
            return {} as T;
          };
        }
      }

      return Reflect.get(target, prop, receiver);
    },
  });
}

export type Parz<T> = {
  parse(value: unknown): T;
  mock(): T;
};

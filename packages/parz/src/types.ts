export type Parz<T> = {
  parse(value: unknown): T;
  mock(): T;
};

export type ParzObject<Def extends Record<string, Parz<unknown>>> = Parz<{
  [K in keyof Def]: ReturnType<Def[K]["parse"]>;
}> & {
  field<K extends keyof Def>(name: K): Def[K];
};

export type Infer<P extends Parz<unknown>> = ReturnType<P["parse"]>;

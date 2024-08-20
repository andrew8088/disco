type AnyFn = (...args: never[]) => unknown;

/* eslint-disable @typescript-eslint/no-unused-vars */
type First<Args> = Args extends [infer A, ...infer _B] ? A : never;
type Rest<Args> = Args extends [infer _A, ...infer B] ? B : never;

type TupleSlices<Tuple extends unknown[]> = Tuple extends []
  ? never
  : Tuple | TupleSlices<Tuple extends [...infer Rest, infer _Last] ? Rest : never>;

/* eslint-enable @typescript-eslint/no-unused-vars */

type Curry<Fn extends AnyFn, Args extends unknown[] = Parameters<Fn>> =
  First<Args> extends never
    ? () => ReturnType<Fn>
    : Rest<Args>["length"] extends 0
      ? (arg: First<Args>) => ReturnType<Fn>
      : (arg: First<Args>) => Curry<Fn, Rest<Args>>;

export function curry<Fn extends AnyFn>(fn: Fn, args?: TupleSlices<Parameters<Fn>>): Curry<Fn> {
  return function curried(arg: First<Parameters<Fn>>) {
    const currentArgs = (args ? [...args, arg] : [arg]) as TupleSlices<Parameters<Fn>>;

    if (currentArgs.length === fn.length) {
      return fn(...currentArgs);
    }

    return curry(fn, currentArgs);
  } as Curry<Fn>;
}

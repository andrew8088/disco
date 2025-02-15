type AnyFn = (...args: never[]) => unknown;

/* eslint-disable @typescript-eslint/no-unused-vars */
type First<Args> = Args extends [infer A, ...infer _B] ? A : never;
type Rest<Args> = Args extends [infer _A, ...infer B] ? B : never;

type TupleSlices<Tuple extends unknown[]> = Tuple extends []
  ? never
  : Tuple | TupleSlices<Tuple extends [...infer Rest, infer _Last] ? Rest : never>;

/* eslint-enable @typescript-eslint/no-unused-vars */

type Remaining<A extends unknown[], B extends unknown[]> = B extends [...A, ...infer Rest]
  ? Rest
  : never;

type ParamSlices<Fn extends AnyFn> = TupleSlices<Parameters<Fn>>;

type Curry<Fn extends AnyFn, Args extends unknown[] = Parameters<Fn>> = First<Args> extends never
  ? () => ReturnType<Fn>
  : Rest<Args>["length"] extends 0
    ? (arg: First<Args>) => ReturnType<Fn>
    : (arg: First<Args>) => Curry<Fn, Rest<Args>>;

export function curry<Fn extends AnyFn, InitialArgs extends TupleSlices<Parameters<Fn>>>(
  fn: Fn,
  args?: InitialArgs,
): Curry<Fn> {
  return function curried(arg: First<Parameters<Fn>>) {
    const currentArgs = (args ? [...args, arg] : [arg]) as TupleSlices<Parameters<Fn>>;

    if (currentArgs.length >= fn.length) {
      return fn(...currentArgs);
    }

    return curry(fn, currentArgs);
  } as Curry<Fn>;
}

export function curryNext<Fn extends AnyFn, InitialArgs extends TupleSlices<Parameters<Fn>>>(
  fn: Fn,
  args?: InitialArgs,
) {
  return function next(...nextArgs: Remaining<InitialArgs, Parameters<Fn>>) {
    return fn(...(args || []), ...nextArgs);
  };
}

export function foo(a: string, b: number, c: boolean) {
  return a + b + c;
}

export const x = curryNext(foo);

type CurriedFunction<InitialArgs extends unknown[], FN extends AnyFn> = <
  NextArgs extends TupleSlices<Remaining<InitialArgs, Parameters<FN>>>,
>(
  ...args: NextArgs
) => CurriedFunctionOrReturnValue<[...InitialArgs, ...NextArgs], FN>;

type CurriedFunctionOrReturnValue<InitialArgs extends unknown[], Fn extends AnyFn> = Remaining<
  InitialArgs,
  Parameters<Fn>
> extends [unknown, ...unknown[]]
  ? CurriedFunction<InitialArgs, Fn>
  : ReturnType<Fn>;

export function curry2<Fn extends AnyFn, InitialArgs extends ParamSlices<Fn>>(
  fn: Fn,
  ...initialArgs: InitialArgs
): CurriedFunction<InitialArgs, Fn> {
  return function (...args) {
    const totalArgs = [...initialArgs, ...args];
    if (totalArgs.length >= fn.length) {
      return fn(...totalArgs);
    }
    return curry(fn, ...(totalArgs as ParamSlices<Fn>));
  };
}

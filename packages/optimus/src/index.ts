import { Parz } from "@disco/parz";

export type Optimus<T> = (input: unknown) => T;

export default function optimus<T, S>(parser: Parz<T>, render: (t: T) => S): Optimus<S> {
  return function (input: unknown): S {
    const result = parser.parse(input);
    return render(result);
  };
}

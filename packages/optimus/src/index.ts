import { Parz } from "@disco/parz";

export default function optimus<T, S>(parser: Parz<T>, render: (t: T) => S) {
  return function (input: unknown): S {
    const result = parser.parse(input);
    return render(result);
  };
}

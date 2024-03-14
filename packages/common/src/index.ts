export function noop() {}

export function deferred<T, E = unknown>() {
  let resolve: (t: T) => void = noop;
  let reject: (e?: E) => void = noop;

  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}

export function pipe<A, B>(fn: (a: A) => B) {
  function run(a: A) {
    return fn(a);
  }

  run.pipe = <C>(fn2: (b: B) => C) => pipe((a: A) => fn2(fn(a)));

  return run;
}

export const noop = () => undefined;

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

class ApplicationError<T = never> extends Error {
  type = "ApplicationError";
  info: T;

  constructor(message: string, info: T) {
    super(message);
    this.info = info;
  }
}

export function createErrorClass<T>(tag: string) {
  const errClass = class extends ApplicationError<T> {
    type = tag;
  };

  Object.defineProperty(errClass, "name", {
    value: tag,
    writable: false,
  });

  return errClass;
}

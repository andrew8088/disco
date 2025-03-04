import { warn } from "node:console";

export async function* take<T>(iterable: AsyncIterable<T>, n: number) {
  let i = 0;
  for await (const x of iterable) {
    if (i >= n) {
      break;
    }
    i++;
    yield x;
  }
}

export async function* map<T, S>(iterable: AsyncIterable<T>, fn: (x: T) => S) {
  for await (const x of iterable) {
    yield fn(x);
  }
}

export async function* flatMap<T, S>(iterable: AsyncIterable<T>, fn: (x: T) => Iterable<S>) {
  for await (const x of iterable) {
    yield* fn(x);
  }
}

export async function* filter<T>(iterable: AsyncIterable<T>, fn: (x: T) => boolean) {
  for await (const x of iterable) {
    if (fn(x)) {
      yield x;
    }
  }
}

export async function* drop<T>(iterable: AsyncIterable<T>, n: number) {
  let i = 0;
  for await (const x of iterable) {
    if (i < n) {
      i++;
      continue;
    }
    yield x;
  }
}

export async function reduce<T, S>(iterable: AsyncIterable<T>, fn: (acc: S, x: T) => S, acc: S) {
  for await (const x of iterable) {
    acc = fn(acc, x);
  }
  return acc;
}

export async function some<T>(iterable: AsyncIterable<T>, fn: (x: T) => boolean) {
  for await (const x of iterable) {
    if (fn(x)) {
      return true;
    }
  }
  return false;
}

export async function every<T>(iterable: AsyncIterable<T>, fn: (x: T) => boolean) {
  for await (const x of iterable) {
    if (!fn(x)) {
      return false;
    }
  }
  return true;
}

export async function find<T>(iterable: AsyncIterable<T>, fn: (x: T) => boolean) {
  for await (const x of iterable) {
    if (fn(x)) {
      return x;
    }
  }
  return undefined;
}

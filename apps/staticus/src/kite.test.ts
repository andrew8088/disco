import { describe, expect, it } from "vitest";
import * as k from "./kite";

async function* fib() {
  let a = 1;
  let b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

describe("kite", () => {
  describe("take", () => {
    it("works", async () => {
      const arr = await Array.fromAsync(k.take(fib(), 4));
      expect(arr).toEqual([1, 1, 2, 3]);
    });
    it("works with shorter iterable", async () => {
      const arr = await Array.fromAsync(k.take(k.take(fib(), 4), 5));
      expect(arr).toEqual([1, 1, 2, 3]);
    });
  });
  describe("map", () => {
    it("works", async () => {
      const arr = await Array.fromAsync(
        k.take(
          k.map(fib(), (x) => x * 2),
          4,
        ),
      );
      expect(arr).toEqual([2, 2, 4, 6]);
    });
  });
  describe("filter", () => {
    it("works", async () => {
      const arr = await Array.fromAsync(
        k.take(
          k.filter(
            k.map(fib(), (x) => x * 2),
            (x) => x > 2,
          ),
          4,
        ),
      );
      expect(arr).toEqual([4, 6, 10, 16]);
    });
  });
  describe("drop", () => {
    it("works", async () => {
      const arr = await Array.fromAsync(k.take(k.drop(fib(), 4), 3));
      expect(arr).toEqual([5, 8, 13]);
    });
  });
  describe("flatMap", () => {
    it("works", async () => {
      const arr = await Array.fromAsync(
        k.take(
          k.flatMap(fib(), (x) => [x, x * 2]),
          8,
        ),
      );
      expect(arr).toEqual([1, 2, 1, 2, 2, 4, 3, 6]);
    });
    it("returns iterable or single elements", async () => {
      const arr = await Array.fromAsync(
        k.take(
          k.flatMap(fib(), (x) => (x % 2 === 0 ? x : [x, x * 2])),
          8,
        ),
      );
      expect(arr).toEqual([1, 2, 1, 2, 2, 3, 6, 5]);
    });
  });
  describe("reduce", () => {
    it("works", async () => {
      const val = await k.reduce(
        k.take(fib(), 4),
        (acc, next) => {
          return acc + next;
        },
        0,
      );
      expect(val).toEqual(7);
    });
  });
  describe("some", () => {
    it("works", async () => {
      const val = await k.some(k.take(fib(), 3), (x) => x === 1);
      expect(val).toEqual(true);
    });
  });
  describe("every", () => {
    it("works", async () => {
      const val = await k.every(k.take(fib(), 3), (x) => x === 1);
      expect(val).toEqual(false);
    });
  });
  describe("find", () => {
    it("works", async () => {
      const val = await k.find(fib(), (x) => x >= 100);
      expect(val).toEqual(144);
    });
    it("returns undefined", async () => {
      const val = await k.find(k.take(fib(), 10), (x) => x >= 100);
      expect(val).toEqual(undefined);
    });
  });
});

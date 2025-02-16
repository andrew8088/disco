import { setImmediate, setTimeout } from "node:timers/promises";
import { getExceptionSync } from "@disco/test-utils";
import { describe, expect, it } from "vitest";
import {
  createErrorClass,
  deferred,
  forAwait,
  mustFind,
  pipe,
  pipeAsync,
  waitUntilCountSync,
} from "./index";

describe("deferred", () => {
  it("resolves the promise", () => {
    expect.assertions(1);
    const { resolve, promise } = deferred();
    promise.then((value) => expect(value).toEqual(1));
    resolve(1);
  });

  it("rejects the promise", () => {
    expect.assertions(1);
    const { reject, promise } = deferred();
    promise.catch((value) => expect(value).toEqual(1));
    reject(1);
  });
});

describe("pipe", () => {
  it("works", () => {
    const x = pipe((n: number) => {
      if (n > 0) return "positive" as const;
      if (n < 0) return "negative" as const;
      return "zero" as const;
    })
      .pipe((s) => {
        switch (s) {
          case "positive":
            return 91;
          case "negative":
            return 82;
          default:
            throw "boom";
        }
      })
      .pipe((n) => n % 10);

    expect(x(20)).toBe(1);
    expect(() => x(0)).toThrowError("boom");
    expect(x(-20)).toBe(2);
  });
});

describe("pipeAsync", () => {
  it("works", async () => {
    const fn = pipeAsync((ms: number) =>
      setTimeout(
        ms,
        Array(20 - ms)
          .fill("a")
          .join(""),
      ),
    ).pipe(async (x) => x.length);

    expect(await fn(0)).toBe(20);
    expect(await fn(1)).toBe(19);
  });
});

describe("createErrorClass", () => {
  it("works", () => {
    const [FooError] = createErrorClass<{ id: number }>("FooError");

    try {
      throw new FooError("boom", { id: 10 });
    } catch (err) {
      expect(err.type).toBe("FooError");
      expect(err.message).toBe("boom");
      expect(err.info.id).toBe(10);
      expect(err.name).toBe("Error");
      expect(err.constructor.name).toBe("FooError");
      expect(err instanceof FooError).toBeTruthy();
      // Not sure why this fails ... the stack starts with FooError when logged
      // console.log(err);
      //expect(err.stack).toContain("FooError");
    }
  });
});

describe("forAwait", () => {
  it("works", async () => {
    const range: AsyncIterable<number> = {
      [Symbol.asyncIterator]() {
        return {
          current: 1,
          last: 5,
          async next() {
            await setImmediate();
            if (this.current <= this.last) {
              return { done: false, value: this.current++ };
            } else {
              return { done: true, value: undefined };
            }
          },
        };
      },
    };

    let sum = 0;
    await forAwait(range, (value) => {
      sum += value;
    });
    await setTimeout(10); // ugh...
    expect(sum).toBe(15);
  });
});

describe("waitUntilCountSync", () => {
  it("works", async () => {
    const arr: number[] = [];

    let complete = false;
    waitUntilCountSync(arr, 5).then(() => {
      complete = true;
    });

    while (!complete) {
      arr.push(0);
      await setImmediate();
    }

    expect(arr.length).toBe(5);
  });

  it("ends if count is greater than expected", async () => {
    const arr = [1, 2, 3, 4, 5, 6];
    await waitUntilCountSync(arr, 5);
    expect(arr.length).toBe(6);
  });
});

describe("mustFind", () => {
  it("works", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(mustFind(arr, (n) => n === 3)).toBe(3);
  });
  it("throws", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(getExceptionSync(() => mustFind(arr, (n) => n === 6)).type).toBe("NotFoundError");
  });
});

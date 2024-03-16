import { assert, it, describe, expect } from "vitest";
import { Http, HttpResponseError } from "./errors";

describe("errors", () => {
  it.each(Object.values(Http).map((e) => [e]))("%s extends HTTPResponseError", (ErrorClass) => {
    const e = new ErrorClass("this is a message", "ERROR");
    assert(e instanceof ErrorClass);
    assert(e instanceof HttpResponseError);
    assert(e instanceof Error);
    expect(e.type).toBe(ErrorClass.type);
    expect(e.message).toBe("this is a message");
    expect(e.info).toBe("ERROR");
  });
});

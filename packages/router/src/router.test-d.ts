import { it, describe, expectTypeOf } from "vitest";
import createRouter from "./router";

describe("router types", () => {
  it("parses url params types", async () => {
    createRouter().get("/user/:userId", ({ params }) => {
      expectTypeOf(params).toEqualTypeOf<{ userId: string }>();
      return [200, ""];
    });
  });
});

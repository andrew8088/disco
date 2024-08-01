import { it, expect, describe } from "vitest";

import { createDao } from "./proxy";

describe("proxy", () => {
  it("works", () => {
    const userDao = createDao<{ id: number; name: string }>();
    const u = userDao.findOneById(1);
    const u2 = userDao.findByName("John");
    expect(u).toEqual({});
    expect(u2).toEqual([]);
  });
});

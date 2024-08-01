import { it, expect, describe } from "vitest";

import { createDao } from "./dao-proxy";

describe("proxy", () => {
  it("works", async () => {
    const userDao = createDao<{ id: number; name: string }>();
    const u = await userDao.findOneById(1);
    const u2 = await userDao.findByName("John");
    expect(u).toEqual({});
    expect(u2).toEqual([]);
  });
});

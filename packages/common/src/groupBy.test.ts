import { describe, expect, it } from "vitest";
import { groupBy } from "./groupBy";

describe("groupBy", () => {
  it("groups by key", async () => {
    const data = [
      { key: "a", value: "1" },
      { key: "b", value: "2" },
      { key: "a", value: "3" },
      { key: "b", value: "4" },
    ];

    const result = groupBy(data, (x) => x.key);

    expect(result).toEqual({
      a: [
        { key: "a", value: "1" },
        { key: "a", value: "3" },
      ],
      b: [
        { key: "b", value: "2" },
        { key: "b", value: "4" },
      ],
    });
  });
});

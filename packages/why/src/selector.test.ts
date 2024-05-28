import * as z from "@disco/parz";
import { describe, it, expect } from "vitest";
import Selector from "./selector";

const user = z.object({
  id: z.number(),
  name: z.string(),
  age: z.number(),
});

const widget = z.object({
  id: z.string(),
  userId: z.number(),
  name: z.string(),
  serial: z.number(),
  available: z.boolean(),
});

describe("Selector", () => {
  it("creates a parser for the selected fields", () => {
    const [parser, query] = new Selector({ user, widget })
      .select("user.id as userId")
      .select("widget.id as widgetId")
      .value();
    const val = parser.parse({ userId: 1, widgetId: "1" });
    expect(val).toEqual({ userId: 1, widgetId: "1" });

    expect(query).toEqual("SELECT user.id as userId, widget.id as widgetId FROM user, widget");
  });

  it("can add tables", () => {
    const [parser, query] = new Selector({ user })
      .select("user.id as userId")
      .table("widget", widget)
      .select("widget.id as widgetId")
      .value();

    const val = parser.parse({ userId: 1, widgetId: "1" });
    expect(val).toEqual({ userId: 1, widgetId: "1" });
    expect(query).toEqual("SELECT user.id as userId, widget.id as widgetId FROM user, widget");
  });
});

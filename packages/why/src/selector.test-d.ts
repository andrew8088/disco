import * as z from "@disco/parz";
import { describe, it, expectTypeOf } from "vitest";
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
    const query = new Selector({ user, widget }).select("user.id as userId").select("widget.id as widgetId").value();

    const val = query.parse({});

    expectTypeOf(val).toEqualTypeOf<{ userId: number; widgetId: string }>();
  });

  it("can add tables", () => {
    const query = new Selector({ user })
      .select("user.id as userId")
      .table("widget", widget)
      .select("widget.id as widgetId")
      .value();

    const val = query.parse({});

    expectTypeOf(val).toEqualTypeOf<{ userId: number; widgetId: string }>();
  });
});

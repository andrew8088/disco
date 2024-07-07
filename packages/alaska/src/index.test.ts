import { describe, it, expect } from "vitest";
import { createMachine } from ".";
import { forAwait, waitUntilCountSync } from "@disco/common";

function getMachine() {
  return createMachine<{
    start: never;
    increment: number;
    stop: never;
    setMax: number;
  }>()({
    data: { count: 0, max: 10 },
    initial: "idle",
    states: {
      idle: {
        on: {
          start: { to: "running" },
          setMax: {
            do: (data, payload) => {
              data.max = payload;
            },
          },
        },
      },
      running: {
        on: {
          increment: {
            if: (data) => data.count < data.max,
            unless: (data) => data.count < 0 - data.max,
            do: (data, payload) => {
              data.count += payload;
            },
          },
          stop: {
            if: (data) => data.count > 0,
            unless: (data) => data.count > 20,
            to: "idle",
          },
        },
      },
    },
  });
}

describe("createMachine", () => {
  it("works", () => {
    const machine = getMachine();
    expect(machine.state).toBe("idle");
    machine.send("increment", 1);
    expect(machine.data.count).toBe(0);
    machine.send("start");
    expect(machine.state).toBe("running");
    machine.send("increment", 1);
    expect(machine.data.count).toBe(1);
    machine.send("increment", 5);
    expect(machine.data.count).toBe(6);
    machine.send("stop");
    expect(machine.state).toBe("idle");
    machine.send("increment", 1);
    expect(machine.data.count).toBe(6);
  });

  it("publishes updates", async () => {
    const machine = getMachine();

    const values: Array<number> = [];
    forAwait(machine, (update) => values.push(update.count));

    machine.send("start");
    machine.send("increment", 1);
    machine.send("increment", 2);
    machine.send("increment", 3);
    machine.send("stop");
    machine.send("increment", 4);

    await waitUntilCountSync(values, 3);

    expect(values).toEqual([1, 3, 6]);
  });

  it("handles if condition on `do`", () => {
    const machine = getMachine();
    machine.send("setMax", 3);
    machine.send("start");
    machine.send("increment", 5);
    machine.send("increment", 5);
    expect(machine.data.count).toBe(5);
  });
  it("handles if condition on `to`", () => {
    const machine = getMachine();
    machine.send("start");
    machine.send("stop");
    expect(machine.state).toBe("running");
  });
  it("handles unless condition on `do`", () => {
    const machine = getMachine();
    machine.send("setMax", 3);
    machine.send("start");
    machine.send("increment", -5);
    machine.send("increment", -5);
    expect(machine.data.count).toBe(-5);
  });
  it("handles unless condition on `to`", () => {
    const machine = getMachine();
    machine.send("start");
    machine.send("increment", 25);
    machine.send("stop");
    expect(machine.state).toBe("running");
  });
});

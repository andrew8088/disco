import { describe, it, expect } from "vitest";
import { createMachine } from ".";
import { forAwait, waitUntilCountSync } from "@disco/common";

function getMachine() {
  return createMachine<{
    start: never;
    increment: number;
    stop: never;
  }>()({
    data: { count: 0 },
    initial: "idle",
    states: {
      idle: {
        on: {
          start: { to: "running" },
        },
      },
      running: {
        on: {
          increment: {
            do: (data, payload) => {
              data.count += payload;
            },
          },
          stop: {
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
});

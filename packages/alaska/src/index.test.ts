import { describe, it, expect } from "vitest";
import { createMachine } from ".";

describe("createMachine", () => {
  it("works", () => {
    const machine = createMachine({
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
              do: (data, payload: number) => {
                data.count += payload;
              },
            },
          },
        },
      },
    });

    expect(machine.state).toBe("idle");
    console.log("count", machine.data.count);
    machine.send("increment", 1 as never);
    console.log("count", machine.data.count);
    machine.send("start", 1 as never);
    expect(machine.state).toBe("running");
    machine.send("increment", 1 as never);
    console.log("count", machine.data.count);
    machine.send("increment", 11 as never);
    console.log("count", machine.data.count);
    expect(machine.data.count).toBe(12);
  });
});

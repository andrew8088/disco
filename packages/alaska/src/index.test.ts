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
              do: (data) => {
                data.count += 1;
              },
            },
            stop: {
              to: "idle",
            },
          },
        },
      },
    });

    expect(machine.state).toBe("idle");
    machine.send("increment");
    expect(machine.data.count).toBe(0);
    machine.send("start");
    expect(machine.state).toBe("running");
    machine.send("increment");
    expect(machine.data.count).toBe(1);
    machine.send("increment");
    expect(machine.data.count).toBe(2);
    machine.send("stop");
    expect(machine.state).toBe("idle");
    machine.send("increment");
    expect(machine.data.count).toBe(2);
  });
});

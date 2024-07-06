import { describe, it, expect } from "vitest";
import { createMachine } from ".";

describe("createMachine", () => {
  it("works", () => {
    const machine = createMachine<{
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
});

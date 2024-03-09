import { expect, test } from "vitest";
import { type AddressInfo } from "node:net";
import http from "http";
import createRouter from "./router";
import { deferred } from "common";

function getAddress(server: http.Server) {
  const { promise, resolve, reject } = deferred<AddressInfo>();

  function get(orElse: () => void) {
    const addr = server.address();
    if (addr && typeof addr !== "string") {
      resolve(addr);
    }
    orElse();
  }

  get(() => server.on("listening", () => get(reject)));

  return promise;
}

test("router", async () => {
  const server = http.createServer().listen(0);

  createRouter(server).get("/", () => "hello world");

  const addr = await getAddress(server);
  const body = await fetch(`http://localhost:${addr.port}/`).then((r) => r.text());
  expect(body).toEqual("hello world");
});

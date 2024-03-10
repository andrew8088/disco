import { expect, it } from "vitest";
import http from "http";
import createRouter from "./router";
import { deferred } from "common";

function getPort(server: http.Server) {
  const { promise, resolve, reject } = deferred<number>();

  server.on("listening", () => {
    const addr = server.address();
    if (addr && typeof addr !== "string") {
      resolve(addr.port);
    }
    reject();
  });

  return promise;
}

it("responds", async () => {
  const server = http.createServer().listen(0);
  createRouter(server).get("/", () => "hello world");

  const port = await getPort(server);
  const body = await fetch(`http://localhost:${port}/`).then((r) => r.text());
  expect(body).toEqual("hello world");
});

it("http methods can only match a given pattern once", async () => {
  const server = http.createServer().listen(0);
  const router = createRouter(server);

  router.get("/hello", () => "hello");

  expect(() => {
    router.get("/hello", () => "goodbye");
  }).toThrowError("cannot register another handler for /hello");
});

import { expect, it, describe } from "vitest";
import http from "http";
import createRouter from "./router";
import { deferred } from "@shaky/common";

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

describe("router", () => {
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

  it("matches routes", async () => {
    const server = http.createServer().listen(0);

    createRouter(server)
      .get("/hello", () => "hello")
      .get("/goodbye", () => "goodbye");

    const port = await getPort(server);
    const body1 = await fetch(`http://localhost:${port}/hello`).then((r) => r.text());
    expect(body1).toEqual("hello");
    const body2 = await fetch(`http://localhost:${port}/goodbye`).then((r) => r.text());
    expect(body2).toEqual("goodbye");
  });

  it("404s if no route matches", async () => {
    const server = http.createServer().listen(0);

    createRouter(server).get("/hello", () => "hello");

    const port = await getPort(server);
    const statusCode = await fetch(`http://localhost:${port}/goodbye`).then((r) => r.status);
    expect(statusCode).toEqual(404);
  });

  it("let handlers set a status code", async () => {
    const server = http.createServer().listen(0);

    createRouter(server).get("/hello", () => [204, undefined]);

    const port = await getPort(server);
    const req = await fetch(`http://localhost:${port}/hello`);
    expect(await req.text()).toEqual("");
    expect(req.status).toEqual(204);
  });
});

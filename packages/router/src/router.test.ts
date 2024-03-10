import { expect, it, describe } from "vitest";
import http from "http";
import createRouter from "./router";
import { deferred } from "@shaky/common";

describe("router", () => {
  it("responds", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/", () => "hello world");

    const body = await client.get("/").then((r) => r.text());
    expect(body).toEqual("hello world");
  });

  it("http methods can only match a given pattern once", async () => {
    const [, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/hello", () => "hello");

    expect(() => {
      router.get("/hello", () => "goodbye");
    }).toThrowError("cannot register another handler for /hello");
  });

  it("matches routes", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server)
      .get("/hello", () => "hello")
      .get("/goodbye", () => "goodbye");

    const body1 = await client.get("/hello").then((r) => r.text());
    expect(body1).toEqual("hello");
    const body2 = await client.get("/goodbye").then((r) => r.text());
    expect(body2).toEqual("goodbye");
  });

  it("404s if no route matches", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => "hello");

    const statusCode = await client.get("/goodbye").then((r) => r.status);
    expect(statusCode).toEqual(404);
  });

  it("let handlers set a status code", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => [204, undefined]);

    const req = await client.get("/hello");
    expect(await req.text()).toEqual("");
    expect(req.status).toEqual(204);
  });
});

async function getClientAndServer() {
  const server = http.createServer().listen(0);
  const port = await getPort(server);
  const baseUrl = `http://localhost:${port}`;

  return [
    {
      get(path: string) {
        return fetch(`${baseUrl}${path}`);
      },
    },
    server,
  ] as const;
}

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

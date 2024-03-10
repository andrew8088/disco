import { expect, it, describe } from "vitest";
import http from "http";
import createRouter from "./router";
import { deferred } from "@disco/common";

describe("router", () => {
  it("responds", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/", () => "hello world");

    await assertResponse(client.get("/"), "hello world");
  });

  it("accepts one handler per http method and path", async () => {
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

    await assertResponse(client.get("/hello"), "hello");
    await assertResponse(client.get("/goodbye"), "goodbye");
  });

  it("404s if no route matches", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => "hello");

    await assertResponse(client.get("/goodbye"), "", 404);
  });

  it("let handlers set a status code", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => [204, undefined]);

    await assertResponse(client.get("/hello"), "", 204);
  });

  it("parses url params", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/user/:userId", ({ params }) => {
      return [200, params.userId.toLocaleUpperCase()];
    });

    await assertResponse(client.get("/user/andrew"), "ANDREW");
  });

  it("recognizes (and throws for) the same path with different token names", async () => {
    const [, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/user/:userId", () => "hello");

    expect(() => {
      router.get("/user/:id", () => "hello");
    }).toThrowError("cannot register another handler for /user/:userId");
  });

  it("recognizes (and throws for) the same path with different token names", async () => {
    const [, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/user/:userId", () => "hello");

    expect(() => {
      router.get("/user/:id", () => "hello");
    }).toThrowError("cannot register another handler for /user/:userId");
  });

  it("matches the longest possible route", async () => {
    const [client, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/user", () => "1");
    router.get("/user/:userId", () => "2");
    router.get("/user/:userId/post", () => "3");

    await assertResponse(client.get("/user"), "1");
    await assertResponse(client.get("/user/andrew"), "2");
    await assertResponse(client.get("/user/andrew/post"), "3");
  });
});

async function assertResponse(req: Promise<Response>, expectedBody: string, expectedStatusCode?: number) {
  const res = await req;
  const actual = await res.text();
  expect(actual).toEqual(expectedBody);

  if (expectedStatusCode) {
    expect(res.status).toEqual(expectedStatusCode);
  }
}

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

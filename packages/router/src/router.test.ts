import { getClientAndServer, getException } from "@disco/test-utils";
import { describe, expect, it } from "vitest";
import createRouter from "./router";

describe("router", () => {
  it("responds", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/", () => ok("hello"));

    await assertResponse(client.get("/"), "hello");
  });

  it("accepts one handler per http method and path", async () => {
    const [, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/hello", () => ok("hello"));

    const err = await getException(() => router.get("/hello", () => ok("goodbye")));
    expect(err.type).toEqual("RouterError");
    expect(err.message).toEqual("cannot register a handler for a path that has a handler");
    expect(err.info).toMatchObject({
      existing: "/hello",
      attempted: "/hello",
    });
  });

  it("matches routes", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server)
      .get("/hello", () => ok("hello"))
      .get("/goodbye", () => ok("goodbye"));

    await assertResponse(client.get("/hello"), "hello");
    await assertResponse(client.get("/goodbye"), "goodbye");
  });

  it("404s if no route matches", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => ok("hello"));

    await assertResponse(client.get("/goodbye"), "", 404);
  });

  it("let handlers set a status code", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/hello", () => [204, undefined]);

    await assertResponse(client.get("/hello"), "", 204);
  });

  it("parses url params", async () => {
    const [client, server] = await getClientAndServer();

    createRouter(server).get("/user/:userId", ({ params }) =>
      ok(params.userId.toLocaleUpperCase()),
    );

    await assertResponse(client.get("/user/andrew"), "ANDREW");
  });

  it("recognizes (and throws for) the same path with different token names", async () => {
    const [, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/user/:userId", () => ok("hello"));

    const err = await getException(() => router.get("/user/:id", () => ok("hello")));
    expect(err.type).toEqual("RouterError");
    expect(err.message).toEqual("cannot register a handler for a path that has a handler");
    expect(err.info).toMatchObject({
      existing: "/user/:userId",
      attempted: "/user/:id",
    });
  });

  it("matches the longest possible route", async () => {
    const [client, server] = await getClientAndServer();

    const router = createRouter(server);

    router.get("/user", () => ok("1"));
    router.get("/user/:userId", () => ok("2"));
    router.get("/user/:userId/post", () => ok("3"));

    await assertResponse(client.get("/user"), "1");
    await assertResponse(client.get("/user/andrew"), "2");
    await assertResponse(client.get("/user/andrew/post"), "3");
  });

  it("strips a trailing slash", async () => {
    const [client, server] = await getClientAndServer();
    createRouter(server).get("/user/", () => ok("1"));
    await assertResponse(client.get("/user"), "1");
  });

  it("adds a leading slash", async () => {
    const [client, server] = await getClientAndServer();
    createRouter(server).get("user", () => ok("1"));
    await assertResponse(client.get("/user"), "1");
  });

  it("accepts post requests", async () => {
    const [client, server] = await getClientAndServer();
    createRouter(server)
      .get("/user", () => ok("0"))
      .post("/user", () => ok("1"));
    await assertResponse(client.post("/user"), "1");
  });
});

async function assertResponse(
  req: Promise<Response>,
  expectedBody: string,
  expectedStatusCode?: number,
) {
  const res = await req;
  const actual = await res.text();
  expect(actual).toEqual(expectedBody);

  if (expectedStatusCode) {
    expect(res.status).toEqual(expectedStatusCode);
  }
}

function ok(body: string): [number, string] {
  return [200, body];
}

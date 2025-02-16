import http from "http";
import { type TestHTTPClient, getClientAndServer } from "@disco/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { R } from "./errors";
import { handleErrors, parseMethodAndBody, parseUrl } from "./middleware";
import { uturn } from "./uturn";

describe("uturn", () => {
  let server: http.Server;
  let client: TestHTTPClient;

  const toText = (r: Response) => r.text();

  beforeEach(async () => {
    [client, server] = await getClientAndServer();
  });

  afterEach(() => {
    server.close();
    server.closeAllConnections();
  });

  it("works", async () => {
    const app = uturn<http.IncomingMessage, http.ServerResponse>()
      .use(parseUrl)
      .use(parseMethodAndBody)
      .use(async (_req, res, ctx) => {
        if (ctx.method !== "POST") throw "boom";
        res.end(`${ctx.method} ${ctx.url.pathname}: ${ctx.body?.toUpperCase()}`);
      });

    server.on("request", handleErrors(app));
    const body = await client.post("/hello", { body: "andrew" }).then(toText);
    expect(body).toEqual("POST /hello: ANDREW");
  });

  it("correctly types with early returns", async () => {
    const app = uturn<http.IncomingMessage, http.ServerResponse>()
      .use(parseMethodAndBody)
      .use(async (_req, _res, ctx) => {
        if (ctx.method !== "GET") return ctx;
        return {
          ...ctx,
          get message() {
            return "this is a get";
          },
        };
      })
      .use(async (_req, _res, ctx) => {
        if (ctx.method !== "POST") return ctx;
        return {
          ...ctx,
          get message() {
            return "this is a post";
          },
        };
      })
      .use(async (_req, res, ctx) => {
        // actually, it's good we have to narrow further here: this means
        // that the type sytstem knows we haven't provided a message for
        // all the other HTTP methods;
        if (ctx.method !== "GET" && ctx.method !== "POST") throw "boom";

        res.end(ctx.message);
      });

    server.on("request", handleErrors(app));
    const body = await client.post("/hello", { body: "andrew" }).then(toText);
    expect(body).toEqual("this is a post");
  });

  it("composes partial apps", async () => {
    const authedRoutes = uturn<http.IncomingMessage, http.ServerResponse>().use(
      (_req, res, ctx: { user: { id: string } }) => {
        res.end(`authed route, user is ${ctx?.user.id}`);
      },
    );

    const unauthedRoutes = uturn<http.IncomingMessage, http.ServerResponse>().use((_req, res) => {
      res.end("unauthed route, no user");
    });

    const app = uturn<http.IncomingMessage, http.ServerResponse>()
      .use((req) => {
        const id = req.headers["x-user-id"];
        if (id === "andrew") {
          return {
            authed: true as const,
            user: { id },
          };
        }

        return { authed: false as const };
      })
      .use((req, res, ctx) => {
        if (ctx.authed) {
          return authedRoutes(req, res, ctx);
        }
        return unauthedRoutes(req, res, ctx);
      });

    server.on("request", handleErrors(app));
    const body1 = await client.get("/", { headers: { "x-user-id": "andrew" } }).then(toText);
    expect(body1).toEqual("authed route, user is andrew");

    const body2 = await client.get("/").then(toText);
    expect(body2).toEqual("unauthed route, no user");
  });

  it("handles errors", async () => {
    const app = uturn<http.IncomingMessage, http.ServerResponse>()
      .use(parseUrl)
      .use(parseMethodAndBody)
      .use(function final(_req, res, ctx) {
        if (ctx.method === "GET") throw new Error("boom");
        res.end("success");
      });

    server.on("request", handleErrors(app));
    const res = await client.get("/");
    expect(res.status).toEqual(500);
    expect(await res.text()).toEqual("");
  });

  it.each([
    [R.BadResponse, 400],
    [R.Unauthorized, 401],
    [R.Forbidden, 403],
    [R.NotFound, 404],
  ])("handles %s errors", async (errorCreator, statusCode) => {
    const app = uturn<http.IncomingMessage, http.ServerResponse>().use(() => {
      throw errorCreator("message", "ERR_CODE");
    });

    server.on("request", handleErrors(app));
    const res = await client.get("/");
    expect(await res.json()).toMatchObject({
      message: "message",
      info: "ERR_CODE",
    });
    expect(res.status).toEqual(statusCode);
  });

  it("throws if the response is never finished", async () => {
    const app = uturn<http.IncomingMessage, http.ServerResponse>()
      .use(parseUrl)
      .use(parseMethodAndBody)
      .use(() => {
        "empty";
      });

    server.on("request", handleErrors(app));
    const res = await client.get("/");
    expect(res.status).toEqual(500);
    expect(await res.text()).toEqual("");
  });
});

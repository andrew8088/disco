import http from "http";
import { expect, it, describe, beforeEach, afterEach } from "vitest";
import { uturn } from "./uturn";
import { parseBody, parseUrl, parseMethod } from "./middleware";

describe("uturn", () => {
  let server: http.Server;

  beforeEach(() => {
    server = http.createServer().listen(3000);
  });

  afterEach(() => {
    server.close();
    server.closeAllConnections();
  });

  it("works", async () => {
    const app = uturn()
      .use(parseMethod)
      .use(parseUrl)
      .use(parseBody)
      .use(async (_req, res, ctx) => {
        if (ctx.method !== "POST") throw "boom";
        res.end(`${ctx.method} ${ctx.url.pathname}: ${ctx.body?.toUpperCase()}`);
      });

    server.on("request", app);
    const body = await fetch("http://localhost:3000/hello", { method: "POST", body: "andrew" }).then((r) => r.text());
    expect(body).toEqual("POST /hello: ANDREW");
  });

  it("correctly types with early returns", async () => {
    const app = uturn()
      .use(parseMethod)
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
        return ctx;
      });

    server.on("request", app);
    const body = await fetch("http://localhost:3000", { method: "POST", body: "andrew" }).then((r) => r.text());
    expect(body).toEqual("this is a post");
  });

  it("composes partial apps", async () => {
    const authedRoutes = uturn<{ user: { id: string } }>().use((_req, res, ctx) => {
      res.end(`authed route, user is ${ctx?.user.id}`);
    });

    const unauthedRoutes = uturn<{ authed: false }>().use((_req, res) => {
      res.end("unauthed route, no user");
    });

    const app = uturn()
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

    server.on("request", app);
    const body1 = await fetch("http://localhost:3000", { headers: { "x-user-id": "andrew" } }).then((r) => r.text());
    expect(body1).toEqual("authed route, user is andrew");

    const body2 = await fetch("http://localhost:3000").then((r) => r.text());
    expect(body2).toEqual("unauthed route, no user");
  });
});

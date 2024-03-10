import { z } from "zod";
import type { Server, IncomingMessage } from "http";

type Handler = (req: IncomingMessage) => unknown | [statusCode: number, body: unknown];

const fullHandlerResponse = z.tuple([z.number(), z.unknown()]).catch(({ input }) => {
  return [200, input];
});

export default function createRouter(server: Server) {
  return Router.fromServer(server);
}

class Router {
  #server: Server;

  #paths = new Set<string>();
  #routes: Array<[path: string, handler: Handler]> = [];

  static fromServer(server: Server) {
    return new Router(server);
  }

  private constructor(server: Server) {
    this.#server = server;
    this.#server.on("request", (req, res) => {
      for (const [path, handler] of this.#routes) {
        if (path === req.url) {
          const [statusCode, body] = fullHandlerResponse.parse(handler(req));
          res.statusCode = statusCode;
          if (body) {
            res.write(body);
          }
          res.end();
          return;
        }
      }
      res.statusCode = 404;
      res.end();
    });
  }

  get(path: string, handler: Handler) {
    if (this.#paths.has(path)) {
      throw new RouterError(`cannot register another handler for ${path}`);
    }

    this.#paths.add(path);
    this.#routes.push([path, handler]);
    return this;
  }
}

class RouterError extends Error {
  type = "RouterError" as const;

  constructor(message: string) {
    super(message);
  }
}

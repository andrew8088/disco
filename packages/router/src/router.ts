import { z } from "zod";
import { MatchFunction, match } from "path-to-regexp";
import type { Server, IncomingMessage, ServerResponse } from "http";

type Handler = (req: { params: Record<string, string> }) => unknown | [statusCode: number, body: unknown];

const fullHandlerResponse = z.tuple([z.number(), z.unknown()]).catch(({ input }) => {
  return [200, input];
});

export default function createRouter(server: Server) {
  return Router.fromServer(server);
}

class Router {
  #paths = new Map<string, string>();
  #routes: Array<[path: MatchFunction<object>, handler: Handler]> = [];

  static fromServer(server: Server) {
    const r = new Router();
    server.on("request", (req, res) => r._handleRequest(req, res));
    return r;
  }

  _handleRequest(req: IncomingMessage, res: ServerResponse) {
    for (const [matchPath, handler] of this.#routes) {
      const match = matchPath(req.url ?? "");

      if (match) {
        const [statusCode, body] = fullHandlerResponse.parse(
          handler({ params: match.params as Record<string, string> }),
        );
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
  }

  get(path: string, handler: Handler) {
    const simplePath = normalizePathTokens(path);

    if (this.#paths.has(simplePath)) {
      throw new RouterError(`cannot register another handler for ${this.#paths.get(simplePath)}`);
    }

    this.#paths.set(simplePath, path);
    this.#routes.push([match(path), handler]);
    return this;
  }
}

class RouterError extends Error {
  type = "RouterError" as const;

  constructor(message: string) {
    super(message);
  }
}

function normalizePathTokens(path: string) {
  return path.replaceAll(/:\w+/g, ":");
}

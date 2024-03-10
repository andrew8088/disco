import { MatchFunction, match } from "path-to-regexp";
import type { Server, IncomingMessage, ServerResponse } from "http";

type Handler = (req: { params: Record<string, string> }) => [statusCode: number, body: unknown];

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
        const [statusCode, body] = handler({ params: match.params as Record<string, string> });
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
    const cleanedPath = cleanPath(path);
    const normalPath = normalizePath(cleanedPath);

    if (this.#paths.has(normalPath)) {
      throw new RouterError(`cannot register another handler for ${this.#paths.get(normalPath)}`);
    }

    this.#paths.set(normalPath, cleanedPath);
    this.#routes.push([match(cleanedPath), handler]);
    return this;
  }
}

class RouterError extends Error {
  type = "RouterError" as const;

  constructor(message: string) {
    super(message);
  }
}

function normalizePath(path: string) {
  return path.replaceAll(/:\w+/g, ":");
}

function cleanPath(path: string) {
  return path.replace(/\/$/, "").replace(/^([^/])/, "/$1");
}

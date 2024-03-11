import { MatchFunction, match } from "path-to-regexp";
import type { Server, IncomingMessage, ServerResponse } from "http";

type Handler<P> = (req: { params: P }) => [statusCode: number, body: unknown];

export default function createRouter(server?: Server) {
  return server ? Router.fromServer(server) : Router.new();
}

const HTTP_METHOD = {
  get: "GET",
  post: "POST",
  put: "PUT",
  delete: "DELETE",
} as const;

type Method = (typeof HTTP_METHOD)[keyof typeof HTTP_METHOD];

function parseMethod(m: string | undefined): Method {
  if (!!m && m.toLowerCase() in HTTP_METHOD) return m as Method;
  else throw new ParserError(`${m} is not a support HTTP method (supported methods: ${Object.values(HTTP_METHOD)})`);
}

class Router {
  #paths = {
    [HTTP_METHOD.get]: new Map<string, string>(),
    [HTTP_METHOD.post]: new Map<string, string>(),
    [HTTP_METHOD.put]: new Map<string, string>(),
    [HTTP_METHOD.delete]: new Map<string, string>(),
  };
  #routes: { [m in Method]: Array<[path: MatchFunction<object>, handler: Handler<unknown>]> } = {
    [HTTP_METHOD.get]: [],
    [HTTP_METHOD.post]: [],
    [HTTP_METHOD.put]: [],
    [HTTP_METHOD.delete]: [],
  };

  static new() {
    return new Router();
  }

  static fromServer(server: Server) {
    const r = new Router();
    server.on("request", (req, res) => r._handleRequest(req, res));
    return r;
  }

  _handleRequest(req: IncomingMessage, res: ServerResponse) {
    for (const [matchPath, handler] of this.#routes[parseMethod(req.method)]) {
      const match = matchPath(req.url ?? "");

      if (match) {
        const [statusCode, body] = handler({ params: match.params });
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

  get<Path extends string>(path: Path, handler: Handler<PathParams<Path>>) {
    const cleanedPath = cleanPath(path);
    const normalPath = normalizePath(cleanedPath);

    if (this.#paths[HTTP_METHOD.get].has(normalPath)) {
      throw new RouterError(`cannot register another handler for ${this.#paths[HTTP_METHOD.get].get(normalPath)}`);
    }

    this.#paths[HTTP_METHOD.get].set(normalPath, cleanedPath);
    this.#routes[HTTP_METHOD.get].push([match(cleanedPath), handler as Handler<unknown>]);
    return this;
  }

  post<Path extends string>(path: Path, handler: Handler<PathParams<Path>>) {
    const cleanedPath = cleanPath(path);
    const normalPath = normalizePath(cleanedPath);

    if (this.#paths[HTTP_METHOD.post].has(normalPath)) {
      throw new RouterError(`cannot register another handler for ${this.#paths[HTTP_METHOD.post].get(normalPath)}`);
    }

    this.#paths[HTTP_METHOD.post].set(normalPath, cleanedPath);
    this.#routes[HTTP_METHOD.post].push([match(cleanedPath), handler as Handler<unknown>]);
    return this;
  }
}

class RouterError extends Error {
  type = "RouterError" as const;

  constructor(message: string) {
    super(message);
  }
}

class ParserError extends Error {
  type = "ParserError" as const;

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

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types */
export type PathParams<
  T extends string,
  Acc extends Record<string, string> = {},
> = T extends `${infer _}/:${infer param}/${infer rest}`
  ? PathParams<rest, Acc & { [key in param]: string }>
  : T extends `${infer _}/:${infer param}`
    ? Acc & { [key in param]: string }
    : Acc;
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-types */

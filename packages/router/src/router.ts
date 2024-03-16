import { match } from "path-to-regexp";
import type { Server } from "http";
import { uturn, parseUrl, parseMethodAndBody, Res, Req } from "@disco/uturn";
import { nameFn } from "@disco/common";

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

class Router {
  #paths = new Map<string, string>();
  #uturn = uturn().use(parseUrl).use(parseMethodAndBody);

  static new() {
    return new Router();
  }

  static fromServer(server: Server) {
    const r = new Router();
    server.on("request", (req, res) =>
      r.#uturn.use(() => {
        res.statusCode = 404;
        res.end("");
        return undefined;
      })(req, res, undefined),
    );
    return r;
  }

  register<Path extends string>(method: Method, path: Path, handler: Handler<PathParams<Path>>) {
    const cleanedPath = cleanPath(path);
    const normalPath = normalizePath(cleanedPath);
    const key = `${method}_${normalPath}`;

    if (this.#paths.has(key)) {
      throw new RouterError(`cannot register another handler for ${this.#paths.get(key)}`);
    }

    this.#paths.set(key, cleanedPath);

    this.#uturn = this.#uturn.use(
      nameFn(`${method}_`, path, (req: Req, res: Res, ctx) => {
        if (ctx.method !== method) return ctx;

        const m = match(cleanedPath)(req.url ?? "");

        if (!m) return ctx;

        const [statusCode, body] = handler({ params: m.params as PathParams<Path> });
        res.statusCode = statusCode;
        if (body) {
          res.write(body);
        }
        res.end();
        return ctx;
      }),
    );

    return this;
  }

  get<Path extends string>(path: Path, handler: Handler<PathParams<Path>>) {
    return this.register(HTTP_METHOD.get, path, handler);
  }

  post<Path extends string>(path: Path, handler: Handler<PathParams<Path>>) {
    return this.register(HTTP_METHOD.post, path, handler);
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

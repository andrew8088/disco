import type { Server, IncomingMessage, ServerResponse } from "http";
import { uturn, parseUrl, parseMethodAndBody } from "@disco/uturn";
import { createErrorClass, nameFn } from "@disco/common";
import { PathParams, parseUrlToParams, cleanPath, normalizePath } from "./path";

const [RouterError] = createErrorClass<{ existing: string; attempted: string }>("RouterError");

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
  #uturn = uturn<IncomingMessage, ServerResponse>().use(parseUrl).use(parseMethodAndBody);

  static new() {
    return new Router();
  }

  static fromServer(server: Server) {
    const r = new Router();
    server.on("request", (req, res) => r.#uturn.use(final404)(req, res, undefined));
    return r;
  }

  register<Path extends string>(method: Method, path: Path, handler: Handler<PathParams<Path>>) {
    const cleanedPath = cleanPath(path);
    const normalPath = normalizePath(cleanedPath);
    const key = `${method}_${normalPath}`;
    const existing = this.#paths.get(key);

    if (existing) {
      throw new RouterError(`cannot register a handler for a path that has a handler`, {
        existing,
        attempted: cleanedPath,
      });
    }

    this.#paths.set(key, cleanedPath);

    this.#uturn = this.#uturn.use(
      nameFn(`${method}_${path}`, (req: IncomingMessage, res: ServerResponse, ctx) => {
        if (ctx.method !== method) return ctx;

        const params = parseUrlToParams(cleanedPath, req.url);
        if (!params) return ctx;

        const [statusCode, body] = handler({ params });

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

function final404<T>(_req: T, res: ServerResponse) {
  res.statusCode = 404;
  res.end("");
  return undefined;
}

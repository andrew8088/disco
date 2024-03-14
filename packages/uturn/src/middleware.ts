import { deferred } from "@disco/common";
import { UturnParseError } from "./errors";
import type { Req, Res } from "./uturn";

export function parseUrl<T>(req: Req, _res: Res, ctx: T) {
  if (!req.url) {
    throw new UturnParseError("request has no url", req);
  }

  return {
    ...ctx,
    url: new URL(req.url, `http://${req.headers.host}`),
  };
}

const NO_BODY_METHODS = ["GET", "HEAD", "OPTIONS"] as const;
type SupportedNoBodyMethod = (typeof NO_BODY_METHODS)[number];
const BODY_METHODS = ["POST", "PUT", "PATCH", "DELETE"] as const;
type SupportedBodyMethod = (typeof BODY_METHODS)[number];
type SupportedMethod = SupportedNoBodyMethod | SupportedBodyMethod;

function isSupportedMethod(method: string): method is SupportedMethod {
  return (
    NO_BODY_METHODS.includes(method as SupportedNoBodyMethod) || BODY_METHODS.includes(method as SupportedBodyMethod)
  );
}

function methodSupportsBody(method: SupportedMethod): method is SupportedBodyMethod {
  return BODY_METHODS.includes(method as SupportedBodyMethod);
}

// this seems to be necessaary to allow method-based narrowing later: each method is its own union member.
type ParseMethodContext<T, Method> = Method extends Method ? T & { method: Method } : never;

export function parseMethod<T>(req: Req, _res: Res, ctx: T): ParseMethodContext<T, SupportedMethod> {
  if (!req.method) {
    throw new UturnParseError("request has no method", req);
  }

  if (isSupportedMethod(req.method)) {
    return {
      ...ctx,
      method: req.method,
    };
  }

  throw new UturnParseError(`request has unsupported method: ${req.method}`, req);
}

type ParseBodyContext<T> = T &
  (
    | {
        method: SupportedNoBodyMethod;
      }
    | {
        method: SupportedBodyMethod;
        body: string;
      }
  );

export function parseBody<T extends { method: SupportedMethod }>(
  req: Req,
  _res: Res,
  ctx: T,
): Promise<ParseBodyContext<T>> {
  const { promise, resolve } = deferred<ParseBodyContext<T>>();
  const { method } = ctx;

  if (!methodSupportsBody(method)) {
    resolve({ ...ctx, method });
  } else {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", () => resolve({ ...ctx, body }));
  }
  return promise;
}

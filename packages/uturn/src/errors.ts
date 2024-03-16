import { createErrorClass } from "@disco/common";
import { UturnResponse } from "./uturn";

type ErrCode = string;
export const [UturnParseError] = createErrorClass("UturnParseError");
export const [HttpResponseError] = createErrorClass<ErrCode>("HttpResponseError");

export const [BadResponseError, BadResponse] = createErrorClass("BadResponseError", HttpResponseError);
export const [UnauthorizedError, Unauthorized] = createErrorClass("UnauthorizedError", HttpResponseError);
export const [ForbiddenError, Forbidden] = createErrorClass("ForbiddenError", HttpResponseError);
export const [NotFoundError, NotFound] = createErrorClass("NotFoundError", HttpResponseError);

export const Http = {
  BadResponseError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} as const;

export const R = {
  BadResponse,
  Unauthorized,
  Forbidden,
  NotFound,
} as const;

export const StatusCodes: Record<string, number> = {
  BadResponseError: 400,
  UnauthorizedError: 401,
  ForbiddenError: 403,
  NotFoundError: 404,
};

export function setErrorDetailsOnResponse(err: Error, res: UturnResponse) {
  if (err instanceof HttpResponseError) {
    res.statusCode = StatusCodes[err.type] ?? 500;
    res.end(JSON.stringify({ message: err.message, info: err.info }));
  } else {
    res.statusCode = 500;
    res.end();
  }
}

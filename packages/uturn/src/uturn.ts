import { type IncomingMessage, type ServerResponse } from "http";

export type Req = IncomingMessage;
export type Res = ServerResponse;

type Handler<Ctx, NextCtx> = (req: Req, res: Res, ctx: Ctx) => NextCtx | PromiseLike<NextCtx>;

type Uturn<Ctx, NextCtx> = {
  (req: Req, res: Res, ctx: Ctx): NextCtx | PromiseLike<NextCtx>;
  use<NextNextCtx>(fn2: Handler<NextCtx, NextNextCtx>): Uturn<Ctx, NextNextCtx>;
};

export function uturn<T>() {
  return _uturn((_req, _res, ctx: T) => ctx);
}

function _uturn<Ctx, NextCtx>(next: Handler<Ctx, NextCtx>): Uturn<Ctx, NextCtx> {
  function app(req: Req, res: Res, ctx: Ctx) {
    return next(req, res, ctx);
  }

  app.use = <NextNextCtx>(nextNext: Handler<NextCtx, NextNextCtx>) => {
    return _uturn(async (req: Req, res: Res, ctx: Ctx) => {
      return nextNext(req, res, await next(req, res, ctx));
    });
  };

  return app;
}

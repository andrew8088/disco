import { Writable } from "stream";
import { nameFn } from "@disco/common";

export type UturnResponse = Writable & { statusCode: number };

type Handler<Req, Res, Ctx, NextCtx> = (req: Req, res: Res, ctx: Ctx) => NextCtx | PromiseLike<NextCtx>;

export type Uturn<Req, Res, Ctx, NextCtx> = {
  (req: Req, res: Res, ctx: Ctx): NextCtx | PromiseLike<NextCtx>;
  use<NextNextCtx>(fn2: Handler<Req, Res, NextCtx, NextNextCtx>): Uturn<Req, Res, Ctx, NextNextCtx>;
};

export function uturn<Req, Res>() {
  return {
    use<C, D>(fn: Handler<Req, Res, C, D>) {
      return _uturn<Req, Res, C, D>(fn);
    },
  };
}

function _uturn<Req, Res, Ctx, NextCtx>(next: Handler<Req, Res, Ctx, NextCtx>): Uturn<Req, Res, Ctx, NextCtx> {
  function app(req: Req, res: Res, ctx: Ctx) {
    return next(req, res, ctx);
  }
  nameFn(next.name, app);

  app.use = <NextNextCtx>(nextNext: Handler<Req, Res, NextCtx, NextNextCtx>) => {
    return _uturn(
      nameFn(nextNext.name, async (req: Req, res: Res, ctx: Ctx) => {
        return nextNext(req, res, await next(req, res, ctx));
      }),
    );
  };

  return app;
}

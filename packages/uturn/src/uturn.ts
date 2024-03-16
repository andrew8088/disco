import { Writable } from "stream";
import { setErrorDetailsOnResponse } from "./errors";
import { nameFn } from "@disco/common";

export type UturnResponse = Writable & { statusCode: number };

type Handler<Req, Res, Ctx, NextCtx> = (req: Req, res: Res, ctx: Ctx) => NextCtx | PromiseLike<NextCtx>;

type Uturn<Req, Res, Ctx, NextCtx> = {
  (req: Req, res: Res, ctx: Ctx): Promise<void>;
  use<NextNextCtx>(fn2: Handler<Req, Res, NextCtx, NextNextCtx>): Uturn<Req, Res, Ctx, NextNextCtx>;
};

export function uturn<Req, Res extends UturnResponse>() {
  return {
    use<C, D>(fn: Handler<Req, Res, C, D>) {
      return _uturn<Req, Res, C, D>(fn);
    },
  };
}

function _uturn<Req, Res extends UturnResponse, Ctx, NextCtx>(
  next: Handler<Req, Res, Ctx, NextCtx>,
): Uturn<Req, Res, Ctx, NextCtx> {
  async function app(req: Req, res: Res, ctx: Ctx) {
    try {
      await next(req, res, ctx);

      if (!res.writableFinished) {
        throw new Error();
      }
    } catch (err) {
      setErrorDetailsOnResponse(err, res);
    }
  }
  nameFn("app_", next.name, app);

  app.use = <NextNextCtx>(nextNext: Handler<Req, Res, NextCtx, NextNextCtx>) => {
    return _uturn(
      nameFn("wrapper_", nextNext.name, async (req: Req, res: Res, ctx: Ctx) => {
        return nextNext(req, res, await next(req, res, ctx));
      }),
    );
  };

  return app;
}

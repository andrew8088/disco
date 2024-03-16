import { type IncomingMessage, type ServerResponse } from "http";
import { setErrorDetailsOnResponse } from "./errors";
import { nameFn } from "@disco/common";

export type Req = IncomingMessage;
export type Res = ServerResponse;

type Handler<Ctx, NextCtx> = (req: Req, res: Res, ctx: Ctx) => NextCtx | PromiseLike<NextCtx>;

type Uturn<Ctx, NextCtx> = {
  (req: Req, res: Res, ctx: Ctx): Promise<void>;
  use<NextNextCtx>(fn2: Handler<NextCtx, NextNextCtx>): Uturn<Ctx, NextNextCtx>;
};

export function uturn() {
  return {
    use: _uturn,
  };
}

function _uturn<Ctx, NextCtx>(next: Handler<Ctx, NextCtx>): Uturn<Ctx, NextCtx> {
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

  app.use = <NextNextCtx>(nextNext: Handler<NextCtx, NextNextCtx>) => {
    return _uturn(
      nameFn("wrapper_", nextNext.name, async (req: Req, res: Res, ctx: Ctx) => {
        return nextNext(req, res, await next(req, res, ctx));
      }),
    );
  };

  return app;
}

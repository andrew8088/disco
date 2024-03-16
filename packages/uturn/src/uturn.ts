import { type IncomingMessage, type ServerResponse } from "http";
import { setErrorDetailsOnResponse } from "./errors";
import { nameFn } from "@disco/common";

export type Req = IncomingMessage;
export type Res = ServerResponse;

type Handler<Ctx, NextCtx> = (req: Req, res: Res, ctx: Ctx) => NextCtx | PromiseLike<NextCtx>;

type Uturn<Ctx, NextCtx> = {
  (req: Req, res: Res, ctx: Ctx): NextCtx | PromiseLike<NextCtx>;
  use<NextNextCtx>(fn2: Handler<NextCtx, NextNextCtx>): Uturn<Ctx, NextNextCtx>;
};

export function uturn() {
  return {
    use: _uturn,
  };
}

function _uturn<Ctx, NextCtx>(next: Handler<Ctx, NextCtx>): Uturn<Ctx, NextCtx> {
  function app(req: Req, res: Res, ctx: Ctx) {
    try {
      return next(req, res, ctx);
    } catch (err) {
      setErrorDetailsOnResponse(err, res);
      return Promise.resolve({} as NextCtx);
    }
  }
  nameFn("app_", next.name, app);

  app.use = <NextNextCtx>(nextNext: Handler<NextCtx, NextNextCtx>) => {
    const wrapper = async (req: Req, res: Res, ctx: Ctx) => {
      try {
        const nextCtx = await next(req, res, ctx);
        return nextNext(req, res, nextCtx);
      } catch (err) {
        setErrorDetailsOnResponse(err, res);
        return Promise.resolve({} as NextNextCtx);
      }
    };

    nameFn("wrapper_", nextNext.name, wrapper);

    return _uturn(wrapper);
  };

  return app;
}

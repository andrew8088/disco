import type { Server, IncomingMessage } from "http";

export default function createRouter(server: Server) {
  return Router.fromServer(server);
}

class Router {
  #server: Server;

  #paths = new Set<string>();
  #routes: Array<[path: string, handler: (req: IncomingMessage) => unknown]> = [];

  static fromServer(server: Server) {
    return new Router(server);
  }

  private constructor(server: Server) {
    this.#server = server;
    this.#server.on("request", (req, res) => {
      for (const [path, handler] of this.#routes) {
        if (path === req.url) {
          const body = handler(req);
          res.write(body);
          res.end();
        }
      }
    });
  }

  get<T>(path: string, handler: (req: IncomingMessage) => T) {
    if (this.#paths.has(path)) {
      throw new RouterError(`cannot register another handler for ${path}`);
    }

    this.#paths.add(path);
    this.#routes.push([path, handler]);
    return this;
  }
}

class RouterError extends Error {
  type = "RouterError" as const;

  constructor(message: string) {
    super(message);
  }
}

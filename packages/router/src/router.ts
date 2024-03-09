import { type Server } from "http";

export default function createRouter(server: Server) {
  return Router.fromServer(server);
}

class Router {
  #server: Server;
  static fromServer(server: Server) {
    return new Router(server);
  }

  private constructor(server: Server) {
    this.#server = server;
  }

  get(_path: string, handler: () => void) {
    this.#server.on("request", (_req, res) => {
      const body = handler();
      res.write(body);
      res.end();
    });
  }
}

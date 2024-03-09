import { type Http2Server } from "node:http2";

export default function createRouter(server: Http2Server) {
  return Router.fromServer(server);
}

class Router {
  #server: Http2Server;
  static fromServer(server: Http2Server) {
    return new Router(server);
  }

  private constructor(server: Http2Server) {
    this.#server = server;
  }

  get(_path: string, handler: () => void) {
    this.#server.on("request", handler);
  }
}

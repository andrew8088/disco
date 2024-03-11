import { deferred } from "@disco/common";
import http from "http";

export async function getClientAndServer() {
  const server = http.createServer().listen(0);
  const port = await getPort(server);
  const baseUrl = `http://localhost:${port}`;

  return [
    {
      get(path: string) {
        return fetch(`${baseUrl}${path}`);
      },
      post(path: string) {
        return fetch(`${baseUrl}${path}`, { method: "POST" });
      },
    },
    server,
  ] as const;
}

function getPort(server: http.Server) {
  const { promise, resolve, reject } = deferred<number>();

  server.on("listening", () => {
    const addr = server.address();
    if (addr && typeof addr !== "string") {
      resolve(addr.port);
    }
    reject();
  });

  return promise;
}

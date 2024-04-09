import { deferred } from "@disco/common";
import http from "http";

export async function getClientAndServer() {
  const server = http.createServer().listen(0);
  const port = await getPort(server);
  const baseUrl = `http://localhost:${port}`;

  return [
    {
      get(path: string, options?: Omit<RequestInit, "method">) {
        return fetch(`${baseUrl}${path}`, options);
      },
      post(path: string, options?: Omit<RequestInit, "method">) {
        return fetch(`${baseUrl}${path}`, { method: "POST", ...options });
      },
    },
    server,
  ] as const;
}

export type TestHTTPClient = Awaited<ReturnType<typeof getClientAndServer>>[0];

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

export async function getException(fn: (...args: never[]) => unknown) {
  try {
    await fn();
  } catch (err) {
    return err;
  }
}

export function captureCallbackArgs<T>(until: (t: T, ts: T[]) => boolean) {
  const { promise, resolve } = deferred<T[]>();
  const values: T[] = [];

  return {
    callback(t: T) {
      values.push(t);

      if (until(t, values)) {
        resolve(values);
      }
    },
    promise,
  };
}

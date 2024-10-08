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
  const { promise, resolve, reject } = Promise.withResolvers<number>();

  server.on("listening", () => {
    const addr = server.address();
    if (addr && typeof addr !== "string") {
      resolve(addr.port);
    }
    reject();
  });

  return promise;
}

export function getExceptionSync(fn: (...args: never[]) => unknown) {
  try {
    fn();
  } catch (err) {
    return err;
  }
}

export async function getException(fn: (...args: never[]) => unknown) {
  try {
    await fn();
  } catch (err) {
    return err;
  }
}

export function captureCallbackArgs<T>(until: number | ((t: T, ts: T[]) => boolean)) {
  const { promise, resolve } = Promise.withResolvers<T[]>();
  const values: T[] = [];

  const fn = typeof until === "number" ? (_t: T, ts: T[]) => ts.length === until : until;

  return {
    callback(t: T) {
      values.push(t);

      if (fn(t, values)) {
        resolve(values);
      }
    },
    promise,
  };
}

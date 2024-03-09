import { expect, test } from "vitest";
import { type AddressInfo } from "node:net";
import http from "node:http2";
import createRouter from "./router";
import { deferred } from "common";

function getAddress(server: http.Http2Server) {
  const { promise, resolve, reject } = deferred<AddressInfo>();

  function get(orElse: () => void) {
    const addr = server.address();
    if (addr && typeof addr !== "string") {
      resolve(addr);
    }
    orElse();
  }

  get(() => server.on("listening", () => get(reject)));

  return promise;
}

test("router", async () => {
  const server = http.createServer();
  const router = createRouter(server);

  router.get("/", () => {
    return "hello world";
  });

  server.listen(0);
  const addr = await getAddress(server);
  const client = http.connect(`http://localhost:${addr.port}`);
  client.on("error", (err) => console.error(err));
  let body = "";
  const req = client.request({ ":path": "/" });
  req.setEncoding("utf8");
  req.on("data", (chunk) => console.log((body += chunk.toString())));
  req.on("end", () => {
    client.close();
    expect(body).toEqual("hello world");
  });
  req.end();
});

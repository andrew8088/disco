import { beforeAll, afterEach } from "vitest";
import { getDb, _setup, _reset } from "./database";

beforeAll(() => {
  _setup(getDb());
});

afterEach(() => {
  _reset(getDb());
});

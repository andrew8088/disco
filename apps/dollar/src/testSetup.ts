import { afterEach, beforeAll } from "vitest";
import { _reset, _setup, getDb } from "./database";

beforeAll(() => {
  _setup(getDb());
});

afterEach(() => {
  _reset(getDb());
  _setup(getDb());
});

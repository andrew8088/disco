import { match } from "path-to-regexp";

export function normalizePath<T extends string>(path: T): T {
  return path.replaceAll(/:\w+/g, ":") as T;
}

export function cleanPath<T extends string>(path: T): T {
  return path.replace(/\/$/, "").replace(/^([^/])/, "/$1") as T;
}

export function parseUrlToParams<Path extends string>(
  path: Path,
  url: string | undefined,
): PathParams<Path> | undefined {
  if (!url) return;
  const m = match(path)(url);
  if (!m) return;
  return m.params as PathParams<Path>;
}

export type PathParams<
  T extends string,
  Acc extends Record<string, string> = Record<string, string>,
> = T extends `${string}/:${infer param}/${infer rest}`
  ? PathParams<rest, Acc & { [key in param]: string }>
  : T extends `${string}/:${infer param}`
    ? Acc & { [key in param]: string }
    : Acc;

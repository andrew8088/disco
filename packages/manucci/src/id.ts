import { v4 as uuid } from "uuid";

type Brand<P extends string, B> = `${P}${string}` & { __brand: B };

const idCharSet = new Set<string>();

export function createId<const P extends string, const N extends string>(prefix: P, name: N) {
  if (idCharSet.has(prefix)) {
    throw new Error(`Id prefix ${prefix} already exists`);
  }

  idCharSet.add(prefix);

  function create(): Brand<P, N> {
    return `${prefix}:${uuid()}` as never;
  }

  create.parse = function parse(id: string): Brand<P, N> {
    if (!id.startsWith(prefix)) {
      throw new Error(`Invalid ${name}Id: [${id}]`);
    }
    return id as never;
  };

  create.mock = function mock(): Brand<P, N> {
    return create();
  };

  return create;
}

export const LedgerId = createId("l", "Ledger");
export type LedgerId = ReturnType<typeof LedgerId>;

export const TransactionId = createId("t", "Transaction");
export type TransactionId = ReturnType<typeof TransactionId>;

export const EntryId = createId("e", "Entry");
export type EntryId = ReturnType<typeof EntryId>;

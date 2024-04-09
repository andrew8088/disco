import { LedgerId } from "./id";

type Account = {
  accountId: `a${string}`;
  name: string;
};

export type Transaction = {
  ledgerId: LedgerId;
  transactionId: `t${string}`;
  entries: Entry[];
  createdAt: Date;
};

export type Entry = {
  value: number; // cents
  accountId: Account["accountId"];
  note: string;
};

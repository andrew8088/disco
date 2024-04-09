import { AccountId, LedgerId } from "./id";

export type Account = {
  accountId: AccountId;
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

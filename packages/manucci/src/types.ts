import { AccountId, LedgerId } from "./id";

export type Account = {
  accountId: AccountId;
  name: string;
  balance: number; // cents;
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

export type SimpleTransactionCreatePayload = {
  from: string;
  to: string;
  amount: number;
  note?: string;
};

export type ComplexTransactionCreatePayload = (
  | { from: string; amount: number; note?: string }
  | {
      to: string;
      amount: number;
      note?: string;
    }
)[];

export type TransactionCreatePayload = SimpleTransactionCreatePayload | ComplexTransactionCreatePayload;

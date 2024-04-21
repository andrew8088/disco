import { AccountId, EntryId, LedgerId, TransactionId } from "./id";

export type Transaction = {
  ledgerId: LedgerId;
  transactionId: TransactionId;
  entries: Entry[];
  createdAt: Date;
};

export type TransactionRow = {
  ledgerId: LedgerId;
  transactionId: TransactionId;
  createdAt: Date;
};

export type Entry = {
  entryId: EntryId;
  transactionId: TransactionId;
  accountId: AccountId;
  amount: number; // cents
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

import { Id } from "../database";
import { currency } from "../utils";
import { renderTable } from "../views/table";
import * as Entry from "./entry";

export type AccountSummary = {
  accountId: Id;
  entries: Array<Entry.FullEntry>;
  balance: string;
};

export function find(accountId: Id): AccountSummary {
  const entries = Entry.find(accountId);

  const balance = "xxx"; //transactions[transactions.length - 1]?.total ?? "0.00";

  return {
    accountId,
    entries,
    balance,
  };
}

export function render(summary: AccountSummary) {
  const { entries: transactions } = summary;

  return renderTable(
    transactions,
    (t) => [
      t.date.toISOString().split("T")[0],
      currency((t.fromAccount.amount / 100).toFixed(2)),
      t.description,
      t.toAccount.account_name,
    ],
    { separator: " | " },
  );
}

import * as z from "@disco/parz";
import { getDb, Id } from "../database";
import * as Account from "./account";

export type AccountSummary = Account.Account & {
  transactions: Array<SummaryRow>;
  balance: string;
};

const summaryRowParser = z.object({
  description: z.string(),
  amount: z.number(),
  date: z.string(),
  total: z.string(),
});

type SummaryRow = z.Infer<typeof summaryRowParser>;

export function find(accountId: Id): AccountSummary {
  const account = Account.findOne(accountId);
  const transactions = findTransactions(accountId);
  const balance = transactions[transactions.length - 1].total;

  return {
    ...account,
    transactions: findTransactions(accountId),
    balance,
  };
}

function findTransactions(accountId: Id) {
  const raw = getDb()
    .prepare(
      `
SELECT
  description,
  amount,
  date,
  printf('%.2f', sum(amount) OVER (order by date) / 100.0) as total
FROM transactions
JOIN main.journal_entries je on transactions.journal_entry_id = je.id
WHERE account_id = ?
ORDER BY date;`,
    )
    .get(accountId);
  return z.array(summaryRowParser).parse(raw).sort();
}

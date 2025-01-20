import * as z from "@disco/parz";
import { getDb, Id } from "../database";
import { currency } from "../utils";
import { renderTable } from "../views/table";

export type AccountSummary = {
  accountId: Id;
  transactions: Array<SummaryRow>;
  balance: string;
};

const summaryRowParser = z.object({
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  date: z.string(),
  total: z.string(),
});

type SummaryRow = z.Infer<typeof summaryRowParser>;

export function find(accountId: Id): AccountSummary {
  const transactions = findTransactions(accountId);
  const balance = transactions[transactions.length - 1]?.total ?? "0.00";

  return {
    accountId,
    transactions: findTransactions(accountId),
    balance,
  };
}

function findTransactions(accountId: Id) {
  const raw = getDb()
    .prepare(
      `
SELECT
  je.description,
  a.name as category,
  t.amount,
  date,
  printf('%.2f', sum(t.amount) OVER (order by date) / 100.0) as total
FROM transactions t
JOIN journal_entries je on t.journal_entry_id = je.id
JOIN transactions t2 on t.journal_entry_id = t2.journal_entry_id AND t.id != t2.id
JOIN accounts a on t2.account_id = a.id
WHERE t.account_id = ?
ORDER BY date;
`,
    )
    .all(accountId);
  return z.array(summaryRowParser).parse(raw).sort();
}

export function render(summary: AccountSummary) {
  const { transactions } = summary;

  return renderTable(
    transactions,
    (t) => [t.date.split("T")[0], currency((t.amount / 100).toFixed(2)), t.description, t.category],
    { separator: " | " },
  );
}

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
    .all(accountId);
  return z.array(summaryRowParser).parse(raw).sort();
}

export function render(summary: AccountSummary) {
  const { id, name, description, balance, transactions, type } = summary;
  const trxOutput = transactions
    .map(
      (t) =>
        `${t.date.split("T")[0]} | ${dollarCol((t.amount / 100).toFixed(2))} | ${t.description}`,
    )
    .join("\n");

  return `${trxOutput}
${"".padStart(12)} ${dollarCol(balance)}

💳 ${name} - ${description} (${type}, #${id})
  `;
}

function dollarCol(val: string) {
  return val.replace(/^(-)?/, "$1$").padStart(9);
}

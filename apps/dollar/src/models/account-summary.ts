import * as z from "@disco/parz";
import { getDb, Id } from "../database";
import * as Account from "./account";
import { currency } from "../utils";

export type AccountSummary = Account.Account & {
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
  const account = Account.findOne(accountId);
  const transactions = findTransactions(accountId);
  const balance = transactions[transactions.length - 1]?.total ?? "0.00";

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
  const { id, name, description, balance, transactions, type } = summary;

  const dates: string[] = [];
  const amounts: string[] = [];
  const descriptions: string[] = [];
  const categories: string[] = [];

  let dateLen = 0;
  let amountLen = 0;
  let descriptionLen = 0;
  let categoryLen = 0;

  for (const t of transactions) {
    dates.push(t.date.split("T")[0]);
    dateLen = Math.max(dateLen, dates[dates.length - 1].length);

    amounts.push(currency((t.amount / 100).toFixed(2)));
    amountLen = Math.max(amountLen, amounts[amounts.length - 1].length);

    descriptions.push(t.description);
    descriptionLen = Math.max(descriptionLen, descriptions[descriptions.length - 1].length);

    categories.push(t.category);
    categoryLen = Math.max(categoryLen, categories[categories.length - 1].length);
  }

  const trxOutput = transactions
    .map(
      (_, idx) =>
        `${dates[idx].padEnd(dateLen)} | ${amounts[idx].padEnd(amountLen)} | ${descriptions[idx].padEnd(descriptionLen)} | ${categories[idx].padEnd(categoryLen)}`,
    )
    .join("\n");

  return `${trxOutput}
${"".padStart(12)} ${currency(balance)}

💳 ${name} - ${description} (${type}, #${id})
  `;
}

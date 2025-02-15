import * as Account from "../models/account";
import * as AccountSummary from "../models/account-summary";
import { currency } from "../utils";

export async function command() {
  const accounts = Account.find();
  const accountAndSummaryPairs = accounts
    .filter((a) => a.type !== "expense" && a.type !== "placeholder")
    .map((a) => [a, AccountSummary.find(a.id)] as const);

  let total = 0;
  for (const [account, summary] of accountAndSummaryPairs) {
    total += parseFloat(summary.balance);
    console.log(account.name.padEnd(15), currency(summary.balance));
  }
  console.log("".padEnd(15), currency(total.toFixed(2)));
}

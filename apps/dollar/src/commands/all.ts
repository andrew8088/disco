import * as Account from "../models/account";
import * as AccountSummary from "../models/account-summary";
import { currency } from "../utils";

export async function command() {
  const accounts = Account.find();
  const summaries = accounts
    .filter((a) => a.type !== "expense" && a.type !== "placeholder")
    .map((a) => AccountSummary.find(a.id));

  for (const summary of summaries) {
    console.log(summary.name.padEnd(15), currency(summary.balance));
  }
}

import * as AccountQuery from "../models/account/query";
import * as EntryModel from "../models/entry/model";

export async function command() {
  const accounts = AccountQuery.findAll();

  const accountAndEntries = accounts
    .filter((a) => a.type !== "expense" && a.type !== "placeholder")
    .map((a) => [a, EntryModel.findByAccountId(a.id)] as const);

  let total = 0;
  for (const [account, entries] of accountAndEntries) {
    const balance = EntryModel.calculateCurrentBalance(account.id, entries);
    console.log(account.name.padEnd(15), balance / 100);
    total += balance;
  }
  console.log("".padEnd(15), total / 100);
}

import { select } from "@inquirer/prompts";
import * as AccountQuery from "../models/account/query";
import * as EntryModel from "../models/entry/model";
import { $, currency, toChoices } from "../utils";
import { renderTable } from "../views/table";

export async function command() {
  const accounts = AccountQuery.findAll();
  const account = await select({
    message: "Select a `to` account",
    choices: toChoices(accounts, "name"),
  });

  const entries = EntryModel.findByAccountId(account.id);
  const balance = EntryModel.calculateCurrentBalance(account.id, entries);

  const table = renderTable(
    entries,
    (e) => [
      e.date.toISOString().split("T")[0],
      currency((e.fromAccount.amount / 100).toFixed(2)),
      e.description,
      e.toAccount.name,
    ],
    { separator: " | " },
  );

  console.log(`${table}

balance: ${$(balance)}

💳 ${account.name} - ${account.description} (${account.type}, #${account.id})`);
}

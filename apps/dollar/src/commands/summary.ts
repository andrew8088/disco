import { select } from "@inquirer/prompts";
import * as Account from "../models/account";
import * as AccountSummary from "../models/account-summary";
import { currency } from "../utils";

export async function command() {
  const accounts = Account.find();
  const account = await select({
    message: "Select a `to` account",
    choices: Account.toChoices(accounts),
  });

  const summary = AccountSummary.find(account.id);

  const output = `${AccountSummary.render(summary)}

balance: ${currency(summary.balance, 0)}

💳 ${account.name} - ${account.description} (${account.type}, #${account.id})`;

  console.log(output);
}

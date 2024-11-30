import { select } from "@inquirer/prompts";
import * as Account from "../models/account";
import * as AccountSummary from "../models/account-summary";

export async function command() {
  const account = await Account.select((accounts) =>
    select({
      message: "Select a `to` account",
      choices: Account.toChoices(accounts),
    }),
  );

  const summary = AccountSummary.find(account.id);
  console.log(AccountSummary.render(summary));
}

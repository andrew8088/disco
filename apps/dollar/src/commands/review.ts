import { select } from "@inquirer/prompts";
import * as Account from "../models/account";
import * as Entry from "../models/entry";
import { currency } from "../utils";

export async function command() {
  const entries = Entry.find();
  const accounts = Account.find().filter(
    (a) => a.type === "expense" && a.description.trim() === "",
  );

  for (const entry of entries) {
    console.log(`\n\n${entry.date} | ${entry.journal_entry_id}`);
    console.log(`${entry.description}`);
    console.log(entry.fromAccount.account_name, "=>", entry.toAccount.account_name);
    console.log(currency((entry.fromAccount.amount / 100).toFixed(2), 0));

    const input = await select<Account.Account | null>({
      message: "change `to` account?",
      choices: [
        { name: "no, do not change", value: null, description: "" },
        ...Account.toChoices(accounts),
      ],

      pageSize: 26,
    });

    if (input) {
      Entry.update(entry.toAccount.transaction_id, { toAccountId: input.id });
    }
  }
}

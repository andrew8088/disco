import { select } from "@inquirer/prompts";
import * as AccountQuery from "../models/account/query";
import * as EntryModel from "../models/entry/model";
import * as TransactionQuery from "../models/transaction/query";
import { currency, toChoices } from "../utils";

export async function command() {
  const entries = EntryModel.findAll();
  const accounts = AccountQuery.findAll().filter(
    (a) => a.type === "expense" && a.description?.trim() === "",
  );

  for (const entry of entries) {
    console.log(`\n\n${entry.date} | ${entry.id}`);
    console.log(`${entry.description}`);
    console.log(entry.fromAccount.name, "=>", entry.toAccount.name);
    console.log(currency((entry.fromAccount.amount / 100).toFixed(2), 0));

    const input = await select<AccountQuery.AccountObject | null>({
      message: "change `to` account?",
      choices: [
        { name: "no, do not change", value: null, description: "" },
        ...toChoices(accounts, "name"),
      ],

      pageSize: 26,
    });

    if (input) {
      TransactionQuery.update(entry.toAccount.transactionId, {
        toAccountId: input.id,
      });
    }
  }
}

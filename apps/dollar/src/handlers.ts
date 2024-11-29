import { select, input } from "@inquirer/prompts";
import { createJournalEntry, createTransactions } from "./database";
import { parseAmount } from "./utils";
import * as Account from "./account";
import { calendar } from "./inquirer-calendar";

export async function purchase(accounts: Array<Account.Account>) {
  await transaction(accounts, Account.sources, Account.expenses);
}

export async function transfer(accounts: Array<Account.Account>) {
  await transaction(accounts, Account.sources, Account.sources);
}

export async function mortgage(accounts: Array<Account.Account>) {
  await transaction(
    accounts,
    (as) => as.filter((a) => a.name === "Bank Account"),
    (as) => as.filter((a) => a.name === "Mortgage"),
  );
}

export async function newExpense() {
  const name = await input({ message: "Enter a name" });
  const description = await input({ message: "Enter a description" });
  const id = Account.create(name, description, "expense");
  console.log(`✔ created new expense account: ${name} (${id})`);
}

async function transaction(
  accounts: Array<Account.Account>,
  fromFn: (accounts: Array<Account.Account>) => Array<Account.Account>,
  toFn: (accounts: Array<Account.Account>) => Array<Account.Account>,
) {
  const date = await calendar({ message: "Select a date" });
  const description = await input({ message: "Enter a description" });
  const amount = parseAmount(await input({ message: "Enter an amount (e.g. 10.00)" }));

  const fromAccount = await select({
    message: "Select a from account",
    choices: Account.toChoices(fromFn(accounts)),
  });

  const toAccount = await select({
    message: "Select a to account",
    choices: Account.toChoices(toFn(accounts)),
  });

  const journalEntryId = createJournalEntry(date, description);
  createTransactions(journalEntryId, amount, fromAccount.id, toAccount.id);
}

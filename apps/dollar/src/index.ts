import { select } from "@inquirer/prompts";
import { findAccounts } from "./database";

async function main() {
  const accounts = findAccounts();
  const assets = accounts.filter(
    (account) => account.type === "asset" || account.type === "liability",
  );
  const expenses = accounts.filter((account) => account.type === "expense");

  const fromAccount = await select({
    message: "Select a from account",
    choices: assets.map((account) => ({
      name: account.name,
      value: account,
      description: account.description,
    })),
  });

  const toAccount = await select({
    message: "Select a to account",
    choices: expenses.map((account) => ({
      name: account.name,
      value: account,
      description: account.description,
    })),
  });

  console.log({ fromAccount, toAccount });
}

main();

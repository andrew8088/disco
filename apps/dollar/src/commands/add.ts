import { input, select } from "@inquirer/prompts";
import { calendar } from "../inquirer-calendar";
import * as AccountQuery from "../models/account/query";
import * as Entry from "../models/entry/model";
import * as TemplateQuery from "../models/template/query";
import { toChoices } from "../utils";
import { parseAmount } from "../utils";

const STANDARD_TEMPLATES: TemplateQuery.TemplateObject[] = [
  {
    id: "1000",
    name: "Empty",
    transactions: [{}],
  },
];

export async function command() {
  const templates = TemplateQuery.findAll();
  const template = await select({
    message: "Select a template",
    choices: toChoices([...STANDARD_TEMPLATES, ...templates], "name"),
  });

  const entries = await Promise.all(template.transactions.map((t) => Entry.complete(t, form)));
  entries.forEach((e) => Entry.create(e));
}

const form = {
  getDate: () => calendar({ message: "Select a date" }),
  getDescription: () => input({ message: "Enter a description" }),
  getAmount: async () => parseAmount(await input({ message: "Enter an amount (e.g. 10.00)" })),
  getFromAccountId: async () => {
    const accounts = AccountQuery.findAll();
    const fromAccount = await select({
      message: "Select a `from` account",
      choices: toChoices(accounts, "name"),
    });
    return fromAccount.id;
  },
  getToAccountId: async () => {
    const accounts = AccountQuery.findAll();
    const toAccount = await select({
      message: "Select a `to` account",
      choices: toChoices(accounts, "name"),
    });
    return toAccount.id;
  },
};

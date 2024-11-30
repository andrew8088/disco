import * as Template from "../models/template";
import * as Entry from "../models/entry";
import { select } from "@inquirer/prompts";

const STANDARD_TEMPLATES: Template.Template[] = [
  {
    id: "1000",
    name: "Empty",
    transactions: [
      {
        fromAccountId: null,
        toAccountId: null,
        description: null,
        amount: null,
        date: null,
      },
    ],
  },
];

export async function command() {
  const templates = Template.find();
  const template = await select({
    message: "Select a template",
    choices: Template.toChoices([...STANDARD_TEMPLATES, ...templates]),
  });

  const entries = await Promise.all(template.transactions.map((t) => Entry.complete(t)));
  entries.forEach((e) => Entry.create(e));
}

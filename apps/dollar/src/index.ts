import * as Template from "./template";
import * as Entry from "./entry";
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

async function main() {
  const templates = Template.find();
  const template = await select({
    message: "Select a template",
    choices: Template.toChoices([...STANDARD_TEMPLATES, ...templates]),
  });

  const entries = await Promise.all(template.transactions.map((t) => Entry.complete(t)));
  entries.forEach((e) => Entry.create(e));
}

main().catch((error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    throw error;
  }
});

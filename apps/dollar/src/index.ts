import * as Template from "./template";
import * as Entry from "./entry";
import { select } from "@inquirer/prompts";
import { Command } from "commander";

const program = new Command();

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

program
  .name("dollar")
  .description("A simple CLI for managing personal finances, using double-entry bookkeeping.");

program
  .command("add")
  .description("Add a new transaction")
  .action(async () => {
    try {
      const templates = Template.find();
      const template = await select({
        message: "Select a template",
        choices: Template.toChoices([...STANDARD_TEMPLATES, ...templates]),
      });

      const entries = await Promise.all(template.transactions.map((t) => Entry.complete(t)));
      entries.forEach((e) => Entry.create(e));
    } catch (error) {
      if (error instanceof Error && error.name === "ExitPromptError") {
        console.log("👋 until next time!");
      } else {
        throw error;
      }
    }
  });

program.parse();

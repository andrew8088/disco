import { Command } from "commander";
import { command as all } from "./commands/all";
import { command as add } from "./commands/add";
import { command as summary } from "./commands/summary";
import { handleExitPrompt } from "./utils";

const program = new Command();

program
  .name("dollar")
  .description("A simple CLI for managing personal finances, using double-entry bookkeeping.");

program
  .command("add")
  .description("Add a new transaction")
  .action(() => add().catch(handleExitPrompt));

program
  .command("all")
  .description("View a summary of all transactions")
  .action(() => all().catch(handleExitPrompt));

program
  .command("summary")
  .description("View a summary of an account")
  .action(() => summary().catch(handleExitPrompt));

program.parse();

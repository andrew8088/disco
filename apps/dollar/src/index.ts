import { Command } from "commander";
import { command as add } from "./commands/add";
import { handleExitPrompt } from "./utils";

const program = new Command();

program
  .name("dollar")
  .description("A simple CLI for managing personal finances, using double-entry bookkeeping.");

program
  .command("add")
  .description("Add a new transaction")
  .action(() => add().catch(handleExitPrompt));

program.parse();

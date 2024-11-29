import { select } from "@inquirer/prompts";
import * as Account from "./account";
import * as handlers from "./handlers";

async function main() {
  let cont = true;

  while (cont) {
    const command = await select({
      message: "Select an action",
      choices: [
        { name: "Purchase", value: "purchase" },
        { name: "Transfer", value: "transfer" },
        { name: "Mortgage Interest Update", value: "mortgage" },
        { name: "New Expense Account", value: "newExpense" },
        { name: "Quit", value: "quit" },
      ] as const,
    });
    const accounts = Account.find();

    switch (command) {
      case "quit":
        cont = false;
        break;
      default:
        await handlers[command](accounts);
    }
  }
}

main().catch((error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    throw error;
  }
});

export function parseAmount(amount: string): number {
  if (amount.match(/^\d+\.\d{2}$/) === null) {
    throw new Error("not a valid amount");
  }
  return parseFloat(amount) * 100;
}

export async function handleExitPrompt(error: unknown) {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    throw error;
  }
}

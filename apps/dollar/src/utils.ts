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

export function currency(val: string, pad = 12) {
  return val
    .replace(/^(-)?/, "$1$")
    .replace(/(\d)(\d\d\d\.)/, "$1,$2")
    .padStart(pad);
}

export function $(cents: number) {
  return currency((cents / 100).toFixed(2), 0);
}

export function toChoices<T, K extends keyof T>(items: T[], key: K) {
  return items.map((i) => ({
    name: i[key],
    value: i,
  }));
}

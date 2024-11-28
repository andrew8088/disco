export function parseAmount(amount: string): number {
  if (amount.match(/^\d+\.\d{2}$/) === null) {
    throw new Error("not a valid amount");
  }
  return parseFloat(amount) * 100;
}

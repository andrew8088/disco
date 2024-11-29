export function groupBy<T>(array: T[], key: (t: T) => string): Record<string, T[]> {
  return array.reduce<Record<string, T[]>>((acc, item) => {
    const group = key(item);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
}

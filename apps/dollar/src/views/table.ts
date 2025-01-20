type RenderOptions = {
  separator: string;
};

export function renderTable<T>(
  rows: Array<T>,
  toColumns: (t: T) => Array<string>,
  options: RenderOptions,
) {
  const lengths: Array<number> = [];
  const renderedRows: Array<Array<string>> = [];

  for (const row of rows) {
    const values = toColumns(row);
    renderedRows.push(values);

    for (let i = 0; i < values.length; i++) {
      lengths[i] = Math.max(lengths[i] || 0, values[i].length);
    }
  }

  return renderedRows
    .map((row) =>
      row.reduce((acc, cell, idx) => {
        const curr = cell.padEnd(lengths[idx]);
        return idx === 0 ? curr : `${acc}${options.separator}${curr}`;
      }, ""),
    )
    .join("\n");
}

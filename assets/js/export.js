/** Quotes cells and prevents a spreadsheet from evaluating exported descriptions as formulas. */
export function diaryCSV(entries) {
  const cell = (value) =>
    '"' +
    String(value ?? "")
      .replace(/"/g, '""')
      .replace(/^[=+@-]/, "'$&") +
    '"';
  const rows = [
    [
      "Data",
      "Tipo",
      "Descrizione",
      "Minuti",
      "Ore",
      "Pasto",
      "Qualità",
      "Note",
    ],
    ...entries.map((e) => [
      e.date,
      e.type,
      e.label || "",
      e.minutes || "",
      e.hours || "",
      e.meal || "",
      e.quality || "",
      e.notes || "",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}

export function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

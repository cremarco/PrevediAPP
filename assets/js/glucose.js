// Manual measurements only. Validation describes the storage format, never a clinical range.
export const GLUCOSE_LIMIT = 200;
export const GLUCOSE_CONTEXTS = Object.freeze([
  "A digiuno",
  "Prima di un pasto",
  "Dopo un pasto",
  "Prima di dormire",
  "Dopo attività",
  "Altro momento",
]);

const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const currentDate = () => dateFormatter.format(new Date());

function validDay(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value.startsWith("0000")
  )
    return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export function validateReading(input, today = currentDate()) {
  if (!input || !validDay(today) || !validDay(input.date) || input.date > today)
    throw new Error("Scegli una data valida, oggi o precedente.");
  if (
    typeof input.time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)
  )
    throw new Error("Inserisci un orario valido, nel formato ore e minuti.");

  const rawValue =
    typeof input.value === "number"
      ? String(input.value)
      : typeof input.value === "string"
        ? input.value.trim().replace(",", ".")
        : "";
  const value = Number(rawValue);
  if (
    !/^\d+(?:\.\d+)?$/.test(rawValue) ||
    !Number.isFinite(value) ||
    value < 1 ||
    value > 1000 ||
    Math.abs(value * 10 - Math.round(value * 10)) > 0.0000001
  )
    throw new Error(
      "Inserisci il valore in mg/dL, da 1 a 1000, con al massimo un decimale. Sono limiti del campo.",
    );

  return {
    date: input.date,
    time: input.time,
    value: Math.round(value * 10) / 10,
    context:
      typeof input.context === "string"
        ? input.context.trim().slice(0, 160)
        : "",
    notes:
      typeof input.notes === "string" ? input.notes.trim().slice(0, 300) : "",
  };
}

function safeCreatedAt(value) {
  if (
    typeof value !== "string" ||
    value.length > 40 ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    !validDay(value.slice(0, 10)) ||
    !/^([01]\d|2[0-3]):[0-5]\d:[0-5]\d/.test(value.slice(11)) ||
    !Number.isFinite(Date.parse(value))
  )
    return "";
  return value;
}

/** Invalid optional records are discarded; valid identities and creation times survive a backup. */
export function normalizedReadings(raw, today = currentDate()) {
  if (!Array.isArray(raw) || !validDay(today)) return [];
  const records = [],
    ids = new Set();
  for (const item of raw) {
    if (
      !item ||
      typeof item.id !== "string" ||
      !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,99}$/.test(item.id) ||
      ids.has(item.id)
    )
      continue;
    try {
      const reading = validateReading(item, today);
      records.push({
        ...reading,
        id: item.id,
        createdAt: safeCreatedAt(item.createdAt),
      });
      ids.add(item.id);
    } catch {
      // A malformed reading must not make an otherwise valid local save unreadable.
    }
  }
  return records
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, GLUCOSE_LIMIT);
}

/** The period includes today and uses calendar dates; there are no inferred measurements. */
export function glucoseReport(records, period = 7, today = currentDate()) {
  const days = Number(period) === 30 ? 30 : 7;
  if (!validDay(today))
    throw new Error("Scegli una data valida per il riepilogo.");
  const start = new Date(`${today}T12:00:00Z`);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const from = start.toISOString().slice(0, 10),
    readings = normalizedReadings(records, today).filter(
      (reading) => reading.date >= from,
    ),
    values = readings.map((reading) => reading.value);
  return {
    period: days,
    from,
    to: today,
    records: readings,
    count: readings.length,
    latest: readings[0] || null,
    mean: values.length
      ? Math.round(
          (values.reduce((sum, value) => sum + value, 0) / values.length) * 10,
        ) / 10
      : null,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
  };
}

/** Quote every field and neutralize formula-like text, including leading spaces and tabs. */
export function glucoseCSV(records, today = currentDate()) {
  const cell = (value) => {
    const text = String(value ?? "");
    const safe = /^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  const rows = [
    ["Data", "Ora", "Glucosio (mg/dL)", "Contesto", "Note"],
    ...normalizedReadings(records, today).map((reading) => [
      reading.date,
      reading.time,
      reading.value,
      reading.context,
      reading.notes,
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}

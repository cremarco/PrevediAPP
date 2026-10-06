import test from "node:test";
import assert from "node:assert/strict";
import {
  GLUCOSE_LIMIT,
  validateReading,
  normalizedReadings,
  glucoseReport,
  glucoseCSV,
} from "../assets/js/glucose.js";
import { glucose } from "../assets/js/views/glucose.js";

const today = "2026-10-06";
const reading = (id, date = today, fields = {}) => ({
  id,
  date,
  time: "08:15",
  value: 102.1,
  context: "Il mio contesto",
  notes: "",
  createdAt: "2026-10-06T06:16:20.123Z",
  ...fields,
});

test("Manual readings reject impossible and future dates, including leap-day errors", () => {
  for (const date of ["2026-10-07", "2026-02-29", "2026-04-31", "bad"])
    assert.throws(
      () => validateReading(reading("a", date), today),
      /data valida/,
    );
  assert.equal(
    validateReading(reading("a", "2024-02-29"), today).date,
    "2024-02-29",
  );
});

test("Reading times and values obey the storage format without interpreting the number", () => {
  for (const time of ["24:00", "09:60", "8:15", "08:15:00", ""])
    assert.throws(
      () => validateReading(reading("a", today, { time }), today),
      /orario valido/,
    );
  for (const value of ["", null, true, 0, 1000.1, 102.12, Infinity, "1e2"])
    assert.throws(
      () => validateReading(reading("a", today, { value }), today),
      /limiti del campo/,
    );
  for (const value of [1, 1000, "102,1", "102.10"])
    assert.equal(
      validateReading(reading("a", today, { value }), today).value,
      Number(String(value).replace(",", ".")),
    );
  assert.deepEqual(Object.keys(validateReading(reading("a"), today)), [
    "date",
    "time",
    "value",
    "context",
    "notes",
  ]);
});

test("Free context and notes survive validation with bounded lengths", () => {
  const result = validateReading(
    reading("a", today, {
      context: "  Il contesto personale è libero  ",
      notes: "  Due righe\ncon un dettaglio.  ",
    }),
    today,
  );
  assert.equal(result.context, "Il contesto personale è libero");
  assert.equal(result.notes, "Due righe\ncon un dettaglio.");
  const long = validateReading(
    reading("a", today, { context: "x".repeat(170), notes: "y".repeat(310) }),
    today,
  );
  assert.equal(long.context.length, 160);
  assert.equal(long.notes.length, 300);
});

test("Backup normalization preserves identities and valid creation times without mutating records", () => {
  const input = [
    reading("a", "2026-10-01"),
    reading("b", today, {
      time: "12:00",
      createdAt: "2026-10-06T14:00:00+02:00",
    }),
    reading("a", today, { value: 200 }),
    reading("invalid-date", "2026-02-30"),
    reading("future", "2026-10-07"),
    reading("c", today, { createdAt: "2026-02-30T08:00:00Z" }),
    reading('unsafe"id'),
    null,
  ];
  const before = JSON.stringify(input);
  const normalized = normalizedReadings(input, today);
  assert.deepEqual(
    normalized.map((item) => item.id),
    ["b", "c", "a"],
  );
  assert.equal(normalized[0].createdAt, "2026-10-06T14:00:00+02:00");
  assert.equal(normalized[1].createdAt, "");
  assert.equal(normalized[2].createdAt, input[0].createdAt);
  assert.equal(normalized[2].value, input[0].value);
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(normalizedReadings({ records: input }, today), []);
});

test("Normalization retains the most recent 200 records across old unsorted backups", () => {
  const input = Array.from({ length: GLUCOSE_LIMIT + 4 }, (_, index) =>
    reading(`record-${index}`, index < 4 ? "2026-09-01" : today),
  );
  const normalized = normalizedReadings(input, today);
  assert.equal(normalized.length, GLUCOSE_LIMIT);
  assert.equal(
    normalized.every((item) => item.date === today),
    true,
  );
  assert.equal(new Set(normalized.map((item) => item.id)).size, GLUCOSE_LIMIT);
});

test("Calendar periods include today, exclude future and out-of-period records, and summarize only manual values", () => {
  const records = [
    reading("older", "2026-09-29", { value: 500 }),
    reading("first", "2026-09-30", { value: 90 }),
    reading("latest", today, { time: "18:00", value: 110 }),
    reading("future", "2026-10-07", { value: 300 }),
    reading("impossible", "2026-02-30", { value: 400 }),
  ];
  const weekly = glucoseReport(records, 7, today);
  assert.equal(weekly.from, "2026-09-30");
  assert.deepEqual(
    weekly.records.map((item) => item.id),
    ["latest", "first"],
  );
  assert.equal(weekly.count, 2);
  assert.equal(weekly.mean, 100);
  assert.equal(weekly.min, 90);
  assert.equal(weekly.max, 110);
  assert.equal(weekly.latest.id, "latest");
  assert.equal(glucoseReport(records, 30, today).count, 3);
  assert.equal(glucoseReport(records, "bad", today).period, 7);
  assert.equal(glucoseReport([], 7, "2024-03-01").from, "2024-02-24");
  const empty = glucoseReport([], 7, today);
  assert.deepEqual(
    [empty.latest, empty.mean, empty.min, empty.max],
    [null, null, null, null],
  );
});

test("CSV quotes separators and newlines and neutralizes formula-like free text", () => {
  const records = [
    reading("a", today, {
      context: "=SUM(1;2)",
      notes: '\t+cmd;"quoted"\nsecond line',
    }),
    reading("b", today, { context: "@formula", notes: "-formula" }),
    reading("future", "2026-10-07", { notes: "excluded" }),
  ];
  const csv = glucoseCSV(records, today);
  assert.ok(csv.startsWith('\uFEFF"Data";"Ora";"Glucosio (mg/dL)";'));
  assert.ok(csv.includes('"\'=SUM(1;2)"'));
  assert.ok(csv.includes('"\'+cmd;""quoted""\nsecond line"'));
  assert.ok(csv.includes('"\'@formula";"\'-formula"'));
  assert.ok(!csv.includes("excluded"));
});

test("All-history includes older measurements and exports the same records", () => {
  const records = [
    reading("oldest", "2024-02-29"),
    reading("older", "2026-08-01"),
    reading("latest", today),
    reading("future", "2026-10-07"),
  ];
  const report = glucoseReport(records, "all", today);
  assert.equal(report.period, "all");
  assert.equal(report.from, "2024-02-29");
  assert.equal(report.to, today);
  assert.equal(report.count, 3);
  assert.deepEqual(
    report.records.map((item) => item.id),
    ["latest", "older", "oldest"],
  );
  const csv = glucoseCSV(report.records, today);
  assert.ok(csv.includes("2024-02-29"));
  assert.ok(csv.includes("2026-08-01"));
  assert.ok(!csv.includes("2026-10-07"));
  const empty = glucoseReport([], "all", today);
  assert.deepEqual(
    [empty.period, empty.from, empty.to, empty.count],
    ["all", today, today, 0],
  );
});

test("The all-history register keeps older records editable and exposes total capacity", () => {
  const item = reading("older-record", "2024-02-29");
  const html = glucose({
    state: { glucoseReadings: [item] },
    ui: { glucose: { period: "all" } },
  });
  assert.match(html, /value="all" selected/);
  assert.match(html, /data-action="glucose-edit" data-id="older-record"/);
  assert.match(html, /1 di 200 misurazioni/);
  assert.match(html, /Il CSV contiene tutte le misurazioni/);
});

test("The manual register renders an empty value and escapes imported free text", () => {
  const blank = glucose({
    state: { glucoseReadings: [] },
    ui: { glucose: {} },
  });
  assert.match(blank, /name="value"[^>]*value=""/);
  assert.match(blank, /Non è collegato a un sensore CGM/);
  assert.doesNotMatch(
    blank,
    /HbA1c|Tempo in Target|Fascia Sicura|DATO IN DIRETTA/,
  );
  const item = reading("a", "2024-02-29", {
    context: '<script>alert("x")</script>',
    notes: '<img src=x onerror="alert(1)">',
  });
  const edited = glucose({
    state: { glucoseReadings: [item] },
    ui: { glucose: { period: 30, editing: item.id } },
  });
  assert.ok(
    edited.includes("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"),
  );
  assert.ok(edited.includes("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  assert.ok(!edited.includes("<script>"));
  assert.match(edited, /name="date"[^>]*value="2024-02-29"/);
  assert.match(edited, /Salva le modifiche/);
});

test("Changing the history period preserves the in-memory form draft and edit identity", () => {
  const item = reading("a", "2024-02-29");
  const ui = {
    glucose: {
      period: 30,
      editing: "a",
      draft: {
        date: "2026-10-01",
        time: "13:40",
        value: "115.4",
        context: "Un dettaglio ancora da salvare",
        notes: "La bozza rimane durante il filtro",
      },
    },
  };
  for (const period of [7, 30, "all"]) {
    ui.glucose.period = period;
    const html = glucose({ state: { glucoseReadings: [item] }, ui });
    assert.match(html, /name="date"[^>]*value="2026-10-01"/);
    assert.match(html, /name="time"[^>]*value="13:40"/);
    assert.match(html, /name="value"[^>]*value="115.4"/);
    assert.ok(html.includes("Un dettaglio ancora da salvare"));
    assert.ok(html.includes("La bozza rimane durante il filtro"));
    assert.match(html, /Salva le modifiche/);
  }
  assert.equal(item.value, 102.1);
});

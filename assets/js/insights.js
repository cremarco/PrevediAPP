import { localDate, missions, quizSets } from "../data.js";
import { plateFoods } from "./nutrition-catalog.js";
import { shiftDate } from "./records.js";

export const habitLabels = {
  movement: { label: "Movimento", unit: "min", icon: "bolt", goal: "movement" },
  sleep: { label: "Riposo", unit: "ore", icon: "moon", goal: "sleep" },
  water: { label: "Acqua", unit: "bicchieri", icon: "beaker", goal: "water" },
  mindful: { label: "Pause per te", unit: "min", icon: "face-smile" },
};

export function habitReport(
  state,
  type = "movement",
  period = 7,
  today = localDate(),
) {
  if (!Object.hasOwn(habitLabels, type)) type = "movement";
  period = period === 30 ? 30 : 7;
  const dates = Array.from({ length: period }, (_, i) =>
    shiftDate(today, i - period + 1),
  );
  const grouped = new Map(dates.map((date) => [date, []]));
  for (const entry of state.entries)
    if (entry.type === type && grouped.has(entry.date))
      grouped.get(entry.date).push(entry);
  const values = dates.map((date) => {
    const entries = grouped.get(date);
    if (type === "water") return entries.length;
    if (type === "sleep") return Number(entries.at(-1)?.hours) || 0;
    return entries.reduce(
      (sum, entry) => sum + (Number(entry.minutes) || 0),
      0,
    );
  });
  const registeredDays = [...grouped.values()].filter(
    (items) => items.length,
  ).length;
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    type,
    period,
    dates,
    values,
    registeredDays,
    total: sum,
    average: registeredDays ? sum / registeredDays : 0,
  };
}

export function quizSummary(state, category) {
  const records = (state.quizHistory || []).filter(
    (item) => item.category === category,
  );
  return {
    attempts: records.length,
    best: records.length
      ? Math.max(...records.map((item) => item.correct))
      : null,
    completed:
      records.length > 0 ||
      state.awards.some((award) => award.id === `quiz:${category}`),
  };
}

export function milestones(state) {
  const days = new Map();
  for (const entry of state.entries) {
    if (!days.has(entry.date)) days.set(entry.date, new Set());
    days.get(entry.date).add(entry.type);
  }
  let mostMissions = 0;
  for (const types of days.values())
    mostMissions = Math.max(
      mostMissions,
      missions.filter((mission) => types.has(mission.id)).length,
    );
  const fullDay = mostMissions === missions.length;
  const quizCount = Object.keys(quizSets).filter(
    (category) => quizSummary(state, category).completed,
  ).length;
  return [
    {
      id: "first",
      title: "Il primo germoglio",
      detail: "Registra la tua prima attività.",
      icon: "sun",
      done: state.entries.length > 0,
      count: `${Math.min(state.entries.length, 1)}/1`,
      route: "diario",
    },
    {
      id: "day",
      title: "Un giorno, quattro gesti",
      detail: "Completa le quattro missioni nello stesso giorno.",
      icon: "check",
      done: fullDay,
      count: `${mostMissions}/4`,
      route: "percorso",
    },
    {
      id: "week",
      title: "Sette giorni nel verde",
      detail: "Racconta attività in sette giorni, anche non consecutivi.",
      icon: "calendar-days",
      done: days.size >= 7,
      count: `${Math.min(days.size, 7)}/7`,
      route: "diario",
    },
    {
      id: "learn",
      title: "Le quattro scoperte",
      detail: "Completa un quiz per ogni area del percorso.",
      icon: "book-open",
      done: quizCount === 4,
      count: `${quizCount}/4`,
      route: "progressi",
    },
  ];
}

export function pantryPlate(ids) {
  const groups = Object.fromEntries(
    ["vegetables", "carbs", "protein"].map((group) => [
      group,
      plateFoods.filter(
        (food) => ids.includes(food.id) && food.plateGroup === group,
      ),
    ]),
  );
  const missing = Object.keys(groups).filter((group) => !groups[group].length);
  return {
    missing,
    items: missing.length
      ? []
      : [
          groups.vegetables[0].id,
          (groups.vegetables[1] || groups.vegetables[0]).id,
          groups.carbs[0].id,
          groups.protein[0].id,
        ],
  };
}

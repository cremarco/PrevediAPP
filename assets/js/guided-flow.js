// Practices are intentionally manual: the user decides when a gesture is done.
export const initialPractice = () => ({
  phase: "choose",
  ids: [],
  index: 0,
  completed: [],
  paused: false,
  minutes: "",
  entryId: "",
  date: "",
  saved: true,
});

const copy = (practice) => ({
  ...initialPractice(),
  ...practice,
  ids: [...(practice?.ids || [])],
  completed: [...(practice?.completed || [])],
});

export function beginPractice(ids) {
  const selected = [...new Set(ids)];
  return {
    ...initialPractice(),
    phase: selected.length ? "prepare" : "choose",
    ids: selected,
  };
}

export function reviewPractice(ids) {
  const practice = beginPractice(ids);
  return practice.ids.length
    ? { ...practice, phase: "review", completed: [...practice.ids] }
    : practice;
}

export function activatePractice(practice) {
  const next = copy(practice);
  if (next.phase === "prepare" && next.ids.length)
    return { ...next, phase: "active", paused: false };
  return next;
}

export function stepPractice(practice, action) {
  const next = copy(practice);
  if (
    next.phase !== "active" ||
    next.paused ||
    !["done", "skip"].includes(action)
  )
    return next;
  const current = next.ids[next.index];
  if (!current) return next;
  next.completed = next.completed.filter((id) => id !== current);
  if (action === "done") next.completed.push(current);
  if (next.index + 1 >= next.ids.length)
    return { ...next, phase: "review", paused: false };
  return { ...next, index: next.index + 1 };
}

export function pausePractice(practice) {
  const next = copy(practice);
  return next.phase === "active" ? { ...next, paused: !next.paused } : next;
}

export function previousPractice(practice) {
  const next = copy(practice);
  if (next.phase === "prepare") return { ...next, phase: "choose" };
  if (next.phase === "review" && next.ids.length) {
    next.index = next.ids.length - 1;
    next.phase = "active";
  } else if (next.phase === "active") {
    if (next.index === 0)
      return { ...next, phase: "prepare", paused: false, completed: [] };
    next.index--;
  } else return next;
  return {
    ...next,
    paused: false,
    completed: next.completed.filter((id) => id !== next.ids[next.index]),
  };
}

/** Match written cues to actual elapsed time; pausing leaves the cue in place. */
export function guidedStage(session, timer = {}) {
  const stages = session.stages || [];
  if (!timer.started && !timer.running)
    return {
      index: -1,
      title: "Preparati alla pausa",
      text: session.preparation || session.prompt,
      total: stages.length,
    };
  const duration =
    Number.isFinite(timer.duration) && timer.duration > 0
      ? timer.duration
      : session.minutes * 60;
  const remaining = Number.isFinite(timer.remaining)
    ? Math.max(0, Math.min(duration, timer.remaining))
    : duration;
  const elapsed = Number.isFinite(timer.elapsedMs)
    ? timer.elapsedMs / 1000
    : duration - remaining;
  const ratio = Math.max(0, Math.min(1, elapsed / duration));
  let index = 0;
  for (let step = 0; step < stages.length; step++)
    if (ratio >= stages[step].at) index = step;
  const current = stages[index] || {
    title: "Al tuo ritmo",
    text: session.prompt,
  };
  return {
    index,
    title: current.title,
    text: current.text,
    total: stages.length,
  };
}

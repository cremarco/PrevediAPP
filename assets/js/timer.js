export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** No polling while idle; the clock, rather than tick count, determines elapsed time. */
export function createTimer({
  durations = [60, 180, 300],
  initialDuration = durations[0],
  now = Date.now,
  schedule = setTimeout,
  cancel = clearTimeout,
  onTick = () => {},
  onComplete = () => {},
} = {}) {
  let duration = durations.includes(initialDuration)
    ? initialDuration
    : durations[0];
  let remaining = duration;
  let remainingMs = duration * 1000;
  let running = false;
  let started = false;
  let end = 0;
  let pending = null;
  let generation = 0;

  const snapshot = () => ({
    duration,
    remaining,
    running,
    started,
    end,
    elapsedMs:
      duration * 1000 - (running ? Math.max(0, end - now()) : remainingMs),
  });
  const stopTick = () => {
    generation++;
    if (pending !== null) cancel(pending);
    pending = null;
  };

  function tick() {
    pending = null;
    if (!running) return;
    remainingMs = Math.max(0, end - now());
    remaining = Math.ceil(remainingMs / 1000);
    if (remaining === 0) {
      running = false;
      started = false;
      remaining = duration;
      remainingMs = duration * 1000;
      stopTick();
      onComplete(snapshot());
      return;
    }
    onTick(snapshot());
    // Align the next update with the displayed second, including after a suspended tab.
    const request = generation;
    pending = schedule(
      () => {
        if (request === generation) tick();
      },
      Math.max(1, end - now() - (remaining - 1) * 1000),
    );
  }

  return {
    snapshot,
    setDuration(seconds) {
      if (started || !durations.includes(seconds)) return;
      duration = seconds;
      remaining = seconds;
      remainingMs = seconds * 1000;
    },
    toggle() {
      if (running) {
        remainingMs = Math.max(0, end - now());
        if (remainingMs === 0) {
          stopTick();
          tick();
          return;
        }
        remaining = Math.ceil(remainingMs / 1000);
        running = false;
        stopTick();
      } else {
        started = true;
        running = true;
        end = now() + remainingMs;
        tick();
      }
    },
    reset(seconds = duration) {
      stopTick();
      duration = seconds;
      remaining = seconds;
      remainingMs = seconds * 1000;
      running = false;
      started = false;
      end = 0;
    },
  };
}

export const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

/** No polling while idle; the clock, rather than tick count, determines elapsed time. */
export function createTimer({
  now = Date.now,
  schedule = setTimeout,
  cancel = clearTimeout,
  onTick = () => {},
  onComplete = () => {},
} = {}) {
  let duration = 60;
  let remaining = duration;
  let running = false;
  let started = false;
  let end = 0;
  let pending = null;
  let generation = 0;

  const snapshot = () => ({ duration, remaining, running, started, end });
  const stopTick = () => {
    generation++;
    if (pending !== null) cancel(pending);
    pending = null;
  };

  function tick() {
    pending = null;
    if (!running) return;
    remaining = Math.max(0, Math.ceil((end - now()) / 1000));
    if (remaining === 0) {
      running = false;
      started = false;
      remaining = duration;
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
      if (started || ![60, 180, 300].includes(seconds)) return;
      duration = seconds;
      remaining = seconds;
    },
    toggle() {
      if (running) {
        remaining = Math.max(1, Math.ceil((end - now()) / 1000));
        running = false;
        stopTick();
      } else {
        started = true;
        running = true;
        end = now() + remaining * 1000;
        tick();
      }
    },
    reset(seconds = duration) {
      stopTick();
      duration = seconds;
      remaining = seconds;
      running = false;
      started = false;
      end = 0;
    },
  };
}

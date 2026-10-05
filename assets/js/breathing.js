export const BREATH_CYCLE_MS = 8000;

export function breathingState(timer) {
  const elapsedMs = Math.max(
    0,
    Math.min(
      timer.duration * 1000,
      timer.elapsedMs ?? (timer.duration - timer.remaining) * 1000,
    ),
  );
  const inhaling = elapsedMs % BREATH_CYCLE_MS < BREATH_CYCLE_MS / 2;
  const phaseSeconds = Math.ceil(
    (BREATH_CYCLE_MS / 2 - (elapsedMs % (BREATH_CYCLE_MS / 2))) / 1000,
  );
  return {
    elapsedMs,
    progress: Math.round((elapsedMs / (timer.duration * 1000)) * 1000) / 10,
    remaining: Math.ceil((timer.duration * 1000 - elapsedMs) / 1000),
    phase: timer.running
      ? inhaling
        ? "Inspira"
        : "Espira"
      : timer.started
        ? "In pausa"
        : "Trova la calma",
    cue: timer.running
      ? `${inhaling ? "Il cerchio si apre" : "Il cerchio si raccoglie"} · ${phaseSeconds} s`
      : timer.started
        ? "Il ritmo ti aspetta. Riprendi quando vuoi."
        : "Comincia quando ti senti pronto.",
  };
}

/** A single compositor animation. The timer owns time; visibility only controls motion. */
export function createBreathingMotion({
  document,
  mediaQuery,
  getSnapshot,
  observe,
}) {
  let core = null,
    animation = null,
    observer = null,
    visible = true,
    enabled = true,
    mountVersion = 0;
  const settings = () => ({
    enabled: enabled && !mediaQuery.matches,
    reduced: mediaQuery.matches,
  });

  function clear() {
    mountVersion++;
    animation?.cancel();
    observer?.disconnect();
    animation = null;
    observer = null;
    core = null;
  }

  function update(timer = getSnapshot()) {
    const state = breathingState(timer);
    const phase = document.querySelector("#breathing-phase");
    const cue = document.querySelector("#breathing-cue");
    if (phase && phase.textContent !== state.phase)
      phase.textContent = state.phase;
    if (cue) cue.textContent = state.cue;
    const progress = document.querySelector("#breathing-progress");
    if (progress) {
      progress.style.setProperty("--value", state.progress);
      progress.setAttribute("aria-valuenow", state.progress);
      progress.setAttribute("aria-valuetext", `${state.progress}% della pausa`);
      document.querySelector("#breathing-progress-text").textContent =
        `${state.progress}%`;
    }
    const toggle = document.querySelector("#breathing-motion");
    if (toggle) {
      toggle.checked = settings().enabled;
      toggle.disabled = settings().reduced;
      if (settings().reduced)
        toggle.setAttribute("aria-describedby", "breathing-motion-note");
      else toggle.removeAttribute("aria-describedby");
    }
    const note = document.querySelector("#breathing-motion-note");
    if (note) note.hidden = !settings().reduced;
    if (!core) return;
    if (!settings().enabled || typeof core.animate !== "function") {
      animation?.cancel();
      animation = null;
      return;
    }
    if (!animation) {
      animation = core.animate(
        [
          {
            transform: "scale(0.8)",
            opacity: 0.85,
            offset: 0,
            easing: "ease-in-out",
          },
          {
            transform: "scale(1)",
            opacity: 1,
            offset: 0.5,
            easing: "ease-in-out",
          },
          { transform: "scale(0.8)", opacity: 0.85, offset: 1 },
        ],
        {
          duration: BREATH_CYCLE_MS,
          iterations: Infinity,
          easing: "linear",
        },
      );
      animation.pause();
    }
    animation.currentTime = state.elapsedMs % BREATH_CYCLE_MS;
    if (timer.running && !document.hidden && visible) animation.play();
    else animation.pause();
  }

  function mount() {
    clear();
    core = document.querySelector("[data-breathing-core]");
    if (!core) return;
    visible = true;
    if (observe) {
      const request = mountVersion;
      observer = observe((entries) => {
        if (request !== mountVersion) return;
        visible = entries.some((entry) => entry.isIntersecting);
        update();
      });
      observer.observe(core);
    }
    update();
  }
  document.addEventListener("visibilitychange", () => update());
  mediaQuery.addEventListener("change", () => update());
  return {
    clear,
    mount,
    update,
    settings,
    setEnabled(value) {
      enabled = Boolean(value);
      update();
    },
  };
}

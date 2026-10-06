const MAX_PINES = 3;
const MOTIONS = {
  branch: {
    origin: "20% 75%",
    duration: 9800,
    frames: [
      { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
      { transform: "translate(1.5px, -1px) rotate(1.5deg)", offset: 0.28 },
      { transform: "translate(-1px, 0.5px) rotate(-1.2deg)", offset: 0.65 },
      { transform: "translate(0, 0) rotate(0deg)", offset: 1 },
    ],
  },
  cone: {
    origin: "50% 80%",
    duration: 8700,
    frames: [
      { transform: "translate(0, 0) rotate(0deg)", offset: 0 },
      { transform: "translate(0.5px, 0) rotate(1.7deg)", offset: 0.18 },
      { transform: "translate(-0.5px, 0) rotate(-1deg)", offset: 0.38 },
      { transform: "translate(0, 0) rotate(0.4deg)", offset: 0.56 },
      { transform: "translate(0, 0) rotate(0deg)", offset: 0.72 },
      { transform: "translate(0, 0) rotate(0deg)", offset: 1 },
    ],
  },
};

/** Quiet, bounded decoration. Reconcile mounts preserve persistent nodes and phase. */
export function createPineMotion({
  document,
  mediaQuery,
  observe,
  enabled: initialEnabled = true,
}) {
  const records = new Map();
  let observer = null,
    root = document,
    enabled = Boolean(initialEnabled),
    suspended = false,
    generation = 0,
    destroyed = false;

  const settings = () => ({
    enabled: enabled && !mediaQuery.matches,
    reduced: mediaQuery.matches,
    suspended,
  });
  const kindOf = (node) => node.getAttribute("data-pine-motion");
  const connected = (node) => node.isConnected && root.contains(node);

  function remove(record) {
    observer?.unobserve?.(record.node);
    record.animation?.cancel();
    record.node.style.transformOrigin = record.originalOrigin;
    records.delete(record.node);
  }

  function updateRecord(record) {
    if (!connected(record.node) || kindOf(record.node) !== record.kind) {
      remove(record);
      return;
    }
    if (!settings().enabled) {
      record.animation?.cancel();
      record.animation = null;
      return;
    }
    if (!record.visible || document.hidden || suspended) {
      record.animation?.pause();
      return;
    }
    if (!record.animation && !record.unsupported) {
      const motion = MOTIONS[record.kind];
      try {
        record.animation = record.node.animate(motion.frames, {
          duration: motion.duration,
          iterations: Infinity,
          easing: "ease-in-out",
        });
      } catch {
        // A static asset is the complete fallback when WAAPI is unavailable.
        record.unsupported = true;
      }
    }
    if (record.animation && record.animation.playState !== "running")
      record.animation.play();
  }

  function update() {
    if (destroyed) return;
    for (const record of records.values()) updateRecord(record);
  }

  function ensureObserver() {
    if (observer) return true;
    if (typeof observe !== "function") return false;
    const request = generation;
    try {
      observer = observe((entries) => {
        if (destroyed || request !== generation) return;
        for (const entry of entries) {
          const record = records.get(entry.target);
          if (!record) continue;
          // Ignore a queued entry from an earlier registration of this node.
          if (typeof entry.time === "number" && entry.time < record.observedAt)
            continue;
          record.visible =
            entry.isIntersecting &&
            (entry.intersectionRatio === undefined ||
              entry.intersectionRatio > 0);
          updateRecord(record);
        }
      });
    } catch {
      observer = null;
    }
    return Boolean(observer);
  }

  function mount(nextRoot = document) {
    if (destroyed) return;
    root = nextRoot;
    const candidates = new Set(
      Array.from(root.querySelectorAll("[data-pine-motion]")).filter(
        (node) =>
          connected(node) &&
          Object.hasOwn(MOTIONS, kindOf(node)) &&
          typeof node.animate === "function",
      ),
    );
    for (const record of records.values()) {
      if (!candidates.has(record.node) || kindOf(record.node) !== record.kind)
        remove(record);
    }
    if (!candidates.size || !ensureObserver()) return;
    for (const node of candidates) {
      if (records.has(node)) continue;
      if (records.size === MAX_PINES) break;
      const kind = kindOf(node);
      const record = {
        node,
        kind,
        visible: false,
        animation: null,
        unsupported: false,
        originalOrigin: node.style.transformOrigin,
        observedAt: document.defaultView?.performance?.now?.() ?? 0,
      };
      records.set(node, record);
      node.style.transformOrigin = MOTIONS[kind].origin;
      observer.observe(node);
    }
    update();
  }

  function clear() {
    generation++;
    for (const record of records.values()) remove(record);
    observer?.disconnect();
    observer = null;
  }

  const visibilityChanged = () => update();
  const preferenceChanged = () => update();
  document.addEventListener("visibilitychange", visibilityChanged);
  mediaQuery.addEventListener("change", preferenceChanged);

  return {
    mount,
    clear,
    settings,
    setEnabled(value) {
      enabled = Boolean(value);
      update();
    },
    setSuspended(value) {
      suspended = Boolean(value);
      update();
    },
    destroy() {
      if (destroyed) return;
      clear();
      destroyed = true;
      document.removeEventListener("visibilitychange", visibilityChanged);
      mediaQuery.removeEventListener("change", preferenceChanged);
    },
  };
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Short action feedback. State and focus update immediately; motion never gates them. */
export function createWidgetMotion({ document, mediaQuery }) {
  const running = new Set();
  const moving = () => !mediaQuery.matches && !document.hidden;
  const inView = (rect) =>
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < document.documentElement.clientHeight &&
    rect.left < document.documentElement.clientWidth;

  function clear() {
    for (const task of running) {
      task.animation.cancel();
      task.ghost?.remove();
    }
    running.clear();
  }

  function track(animation, ghost = null) {
    const task = { animation, ghost };
    running.add(task);
    const finish = () => {
      ghost?.remove();
      running.delete(task);
    };
    animation.finished.then(finish, finish);
  }

  function capture(element) {
    if (!moving() || !element) return null;
    const picture = element.matches?.("[data-food-art]")
      ? element
      : element.querySelector("[data-food-art]");
    if (!picture) return null;
    const rect = picture.getBoundingClientRect();
    if (!inView(rect)) return null;
    return {
      picture: picture.cloneNode(true),
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
    };
  }

  function pulse(selector) {
    if (!moving()) return;
    const target = document.querySelector(selector);
    if (!target?.animate || !inView(target.getBoundingClientRect())) return;
    track(
      target.animate(
        [
          { transform: "scale(0.96)", opacity: 0.8 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration: 230, easing: EASE },
      ),
    );
  }

  function transfer(snapshot, selector) {
    if (!snapshot || !moving()) return;
    const target = document.querySelector(selector);
    if (!target?.animate) return;
    const to = target.getBoundingClientRect();
    if (!inView(to)) return;
    const { picture, rect: from } = snapshot;
    picture.setAttribute("aria-hidden", "true");
    picture.setAttribute("inert", "");
    Object.assign(picture.style, {
      position: "fixed",
      top: `${from.top}px`,
      left: `${from.left}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      pointerEvents: "none",
      zIndex: "70",
      transformOrigin: "top left",
    });
    document.body.append(picture);
    const end = `translate(${to.left - from.left}px,${to.top - from.top}px) scale(${to.width / from.width},${to.height / from.height})`;
    try {
      track(
        picture.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            { transform: end, opacity: 1, offset: 0.85 },
            { transform: end, opacity: 0 },
          ],
          { duration: 380, easing: EASE },
        ),
        picture,
      );
      pulse(selector);
    } catch {
      picture.remove();
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  // Focus can scroll immediately after a render. A fixed clone must not fly
  // toward coordinates sampled before that viewport change.
  document.addEventListener("scroll", clear, { capture: true, passive: true });
  mediaQuery.addEventListener("change", () => {
    if (mediaQuery.matches) clear();
  });
  return { capture, transfer, pulse, clear };
}

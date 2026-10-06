import test from "node:test";
import assert from "node:assert/strict";
import { createWidgetMotion } from "../assets/js/widget-motion.js";

function fixture() {
  const calls = [],
    ghosts = [],
    listeners = {};
  let removed = 0;
  const rect = (left = 10, top = 20) => ({
    left,
    top,
    width: 56,
    height: 56,
    bottom: top + 56,
    right: left + 56,
  });
  function element(position) {
    return {
      style: {},
      attributes: {},
      getBoundingClientRect: () => position,
      matches: () => true,
      cloneNode: () => element(position),
      setAttribute(name, value) {
        this.attributes[name] = value;
      },
      remove() {
        removed++;
      },
      animate(frames, timing) {
        let resolve;
        const animation = {
          frames,
          timing,
          canceled: false,
          finished: new Promise((done) => {
            resolve = done;
          }),
          finish: () => resolve(),
          cancel() {
            this.canceled = true;
            resolve();
          },
        };
        calls.push(animation);
        return animation;
      },
    };
  }
  const source = element(rect()),
    target = element(rect(400, 100));
  const document = {
    hidden: false,
    documentElement: { clientWidth: 1200, clientHeight: 900 },
    body: { append: (ghost) => ghosts.push(ghost) },
    querySelector: () => target,
    addEventListener: (name, listener) => {
      listeners[name] = listener;
    },
  };
  const mediaQuery = {
    matches: false,
    addEventListener: (name, listener) => {
      listeners[`media:${name}`] = listener;
    },
  };
  return {
    source,
    target,
    document,
    mediaQuery,
    calls,
    ghosts,
    listeners,
    removed: () => removed,
    motion: createWidgetMotion({ document, mediaQuery }),
  };
}

test("A food transfer reaches the target and removes its inaccessible visual clone", async () => {
  const f = fixture();
  f.motion.transfer(f.motion.capture(f.source), "target");
  assert.equal(f.ghosts.length, 1);
  assert.equal(f.ghosts[0].attributes["aria-hidden"], "true");
  assert.equal(f.ghosts[0].attributes.inert, "");
  assert.equal(f.ghosts[0].style.pointerEvents, "none");
  assert.equal(f.calls.length, 2);
  assert.match(f.calls[0].frames.at(-1).transform, /translate\(390px,80px\)/);
  f.calls.forEach((animation) => animation.finish());
  await Promise.resolve();
  assert.equal(f.removed(), 1);
});

test("A render interruption cancels both feedback animations and removes the old ghost", async () => {
  const f = fixture();
  f.motion.transfer(f.motion.capture(f.source), "target");
  f.motion.clear();
  assert.ok(f.calls.every((animation) => animation.canceled));
  assert.equal(f.removed(), 1);
  await Promise.resolve();
  const count = f.calls.length;
  f.motion.clear();
  assert.equal(f.calls.length, count);
});

test("Reduced motion retains the rendered state without creating spatial feedback", () => {
  const f = fixture();
  f.mediaQuery.matches = true;
  assert.equal(f.motion.capture(f.source), null);
  f.motion.pulse("target");
  f.motion.transfer(
    { picture: f.source, rect: f.source.getBoundingClientRect() },
    "target",
  );
  assert.equal(f.calls.length, 0);
  assert.equal(f.ghosts.length, 0);
});

test("Hiding the page or changing the motion preference clears an active transfer", () => {
  for (const trigger of ["visibilitychange", "media:change"]) {
    const f = fixture();
    f.motion.transfer(f.motion.capture(f.source), "target");
    if (trigger === "visibilitychange") f.document.hidden = true;
    else f.mediaQuery.matches = true;
    f.listeners[trigger]();
    assert.ok(f.calls.every((animation) => animation.canceled));
    assert.equal(f.removed(), 1);
  }
});

test("An offscreen destination never creates a flight across unrelated content", () => {
  const f = fixture();
  f.target.getBoundingClientRect = () => ({
    left: 0,
    top: -100,
    width: 56,
    height: 56,
    right: 56,
    bottom: -44,
  });
  f.motion.transfer(f.motion.capture(f.source), "target");
  assert.equal(f.ghosts.length, 0);
  assert.equal(f.calls.length, 0);
});

test("Focus scrolling cancels a flight instead of leaving a stale viewport endpoint", () => {
  const f = fixture();
  f.motion.transfer(f.motion.capture(f.source), "target");
  f.listeners.scroll();
  assert.ok(f.calls.every((animation) => animation.canceled));
  assert.equal(f.removed(), 1);
});

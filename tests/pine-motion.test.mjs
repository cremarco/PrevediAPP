import test from "node:test";
import assert from "node:assert/strict";
import { createPineMotion } from "../assets/js/pine-motion.js";

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type).add(listener);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    emit(type) {
      for (const listener of listeners.get(type) ?? []) listener();
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  };
}

function fixture({
  withObserver = true,
  enabled = true,
  reduced = false,
} = {}) {
  const animations = [],
    observers = [];
  let nodes = [],
    now = 1;
  const document = {
    ...eventTarget(),
    hidden: false,
    defaultView: { performance: { now: () => now } },
    querySelectorAll: () => nodes,
    contains: (node) => nodes.includes(node),
  };
  const mediaQuery = { ...eventTarget(), matches: reduced };

  function node(kind, { animate = true, origin = "" } = {}) {
    const element = {
      kind,
      isConnected: false,
      style: { transformOrigin: origin },
      getAttribute: () => element.kind,
    };
    if (animate)
      element.animate = (frames, timing) => {
        const animation = {
          node: element,
          frames,
          timing,
          currentTime: 0,
          playState: "running",
          play() {
            this.playState = "running";
          },
          pause() {
            this.playState = "paused";
          },
          cancel() {
            this.playState = "idle";
          },
        };
        animations.push(animation);
        return animation;
      };
    return element;
  }

  const motion = createPineMotion({
    document,
    mediaQuery,
    enabled,
    observe: withObserver
      ? (callback) => {
          const observer = {
            observed: new Set(),
            observeCalls: [],
            unobserveCalls: [],
            disconnected: false,
            observe(element) {
              this.observed.add(element);
              this.observeCalls.push(element);
            },
            unobserve(element) {
              this.observed.delete(element);
              this.unobserveCalls.push(element);
            },
            disconnect() {
              this.disconnected = true;
              this.observed.clear();
            },
            emit(element, visible, time = now) {
              callback([
                {
                  target: element,
                  isIntersecting: visible,
                  intersectionRatio: visible ? 1 : 0,
                  time,
                },
              ]);
            },
          };
          observers.push(observer);
          return observer;
        }
      : null,
  });

  return {
    motion,
    document,
    mediaQuery,
    node,
    animations,
    observers,
    attach(nextNodes) {
      for (const element of nodes)
        if (!nextNodes.includes(element)) element.isConnected = false;
      for (const element of nextNodes) element.isConnected = true;
      nodes = nextNodes;
      now++;
    },
    latest: (element) =>
      animations.findLast((animation) => animation.node === element),
  };
}

test("Pines start only after an intersection and their motion stays small", () => {
  const h = fixture();
  const branch = h.node("branch"),
    cone = h.node("cone");
  h.attach([branch, cone]);
  h.motion.mount();
  assert.equal(h.animations.length, 0);
  assert.equal(branch.style.transformOrigin, "20% 75%");
  assert.equal(cone.style.transformOrigin, "50% 80%");
  for (const element of [branch, cone]) {
    h.observers[0].emit(element, false);
    assert.equal(h.latest(element), undefined);
    h.observers[0].emit(element, true);
    const animation = h.latest(element);
    assert.equal(animation.playState, "running");
    assert.equal(animation.timing.iterations, Infinity);
    assert.ok(animation.timing.duration >= 8000);
    for (const frame of animation.frames) {
      const rotation = Number(
        frame.transform.match(/rotate\(([-\d.]+)deg\)/)[1],
      );
      assert.ok(Math.abs(rotation) <= (element.kind === "branch" ? 3 : 2));
      const translation = frame.transform.match(
        /translate\(([-\d.]+)(?:px)?, ([-\d.]+)(?:px)?\)/,
      );
      assert.ok(Math.abs(Number(translation[1])) <= 2);
      assert.ok(Math.abs(Number(translation[2])) <= 2);
      assert.deepEqual(Object.keys(frame).sort(), ["offset", "transform"]);
    }
  }
});

test("The engine observes at most three valid capable decorations", () => {
  const h = fixture();
  const invalid = h.node("tree"),
    unsupported = h.node("cone", { animate: false }),
    valid = [
      h.node("branch"),
      h.node("cone"),
      h.node("branch"),
      h.node("cone"),
    ];
  h.attach([invalid, unsupported, ...valid]);
  h.motion.mount();
  assert.deepEqual(h.observers[0].observeCalls, valid.slice(0, 3));
  for (const element of [invalid, unsupported, ...valid])
    h.observers[0].emit(element, true);
  assert.equal(h.animations.length, 3);
  assert.equal(invalid.style.transformOrigin, "");
  assert.equal(unsupported.style.transformOrigin, "");
});

test("Offscreen, hidden and suspended pines pause and retain their phase", () => {
  const h = fixture();
  const cone = h.node("cone");
  h.attach([cone]);
  h.motion.mount();
  h.observers[0].emit(cone, true);
  const animation = h.latest(cone);
  animation.currentTime = 2314;
  h.observers[0].emit(cone, false);
  assert.equal(animation.playState, "paused");
  h.observers[0].emit(cone, true);
  assert.equal(animation.playState, "running");
  h.document.hidden = true;
  h.document.emit("visibilitychange");
  assert.equal(animation.playState, "paused");
  h.motion.setSuspended(true);
  h.document.hidden = false;
  h.document.emit("visibilitychange");
  assert.equal(animation.playState, "paused");
  h.motion.setSuspended(false);
  assert.equal(animation.playState, "running");
  assert.equal(animation.currentTime, 2314);
  assert.equal(h.animations.length, 1);
});

test("A first visible entry while hidden or suspended does not start an animation", () => {
  for (const condition of ["hidden", "suspended"]) {
    const h = fixture();
    const branch = h.node("branch");
    h.attach([branch]);
    if (condition === "hidden") h.document.hidden = true;
    else h.motion.setSuspended(true);
    h.motion.mount();
    h.observers[0].emit(branch, true);
    assert.equal(h.animations.length, 0);
    if (condition === "hidden") {
      h.document.hidden = false;
      h.document.emit("visibilitychange");
    } else h.motion.setSuspended(false);
    assert.equal(h.animations.length, 1);
  }
});

test("Reduced motion and the global preference restore the static asset", () => {
  const h = fixture({ enabled: false });
  const branch = h.node("branch");
  h.attach([branch]);
  h.motion.mount();
  h.observers[0].emit(branch, true);
  assert.equal(h.animations.length, 0);
  h.motion.setEnabled(true);
  const first = h.latest(branch);
  assert.equal(first.playState, "running");
  h.mediaQuery.matches = true;
  h.mediaQuery.emit("change");
  assert.equal(first.playState, "idle");
  assert.deepEqual(h.motion.settings(), {
    enabled: false,
    reduced: true,
    suspended: false,
  });
  h.motion.setEnabled(false);
  h.mediaQuery.matches = false;
  h.mediaQuery.emit("change");
  assert.equal(h.animations.length, 1);
  h.motion.setEnabled(true);
  assert.equal(h.animations.length, 2);
  h.motion.setEnabled(false);
  assert.equal(h.latest(branch).playState, "idle");
  assert.equal(branch.style.transform, undefined);
});

test("An incremental mount keeps the footer animation and replaces only the header", () => {
  const h = fixture();
  const firstHeader = h.node("branch"),
    footer = h.node("cone"),
    nextHeader = h.node("branch");
  h.attach([firstHeader, footer]);
  h.motion.mount();
  const observer = h.observers[0];
  observer.emit(firstHeader, true);
  observer.emit(footer, true);
  const footerAnimation = h.latest(footer);
  footerAnimation.currentTime = 4000;
  h.attach([nextHeader, footer]);
  h.motion.mount();
  assert.equal(h.observers.length, 1);
  assert.equal(observer.disconnected, false);
  assert.deepEqual(observer.unobserveCalls, [firstHeader]);
  assert.deepEqual(observer.observeCalls, [firstHeader, footer, nextHeader]);
  assert.equal(h.latest(firstHeader).playState, "idle");
  assert.equal(h.latest(footer), footerAnimation);
  assert.equal(footerAnimation.currentTime, 4000);
  assert.equal(h.latest(nextHeader), undefined);
  observer.emit(firstHeader, true);
  assert.equal(h.animations.length, 2);
  observer.emit(nextHeader, true);
  assert.equal(h.animations.length, 3);
  h.motion.mount();
  assert.equal(observer.observeCalls.length, 3);
  assert.equal(h.latest(footer), footerAnimation);
});

test("Mount respects its root and does not retain an outside decoration", () => {
  const h = fixture();
  const branch = h.node("branch"),
    footer = h.node("cone");
  h.attach([branch, footer]);
  h.motion.mount();
  h.observers[0].emit(footer, true);
  const root = {
    querySelectorAll: () => [branch],
    contains: (element) => element === branch,
  };
  h.motion.mount(root);
  assert.equal(h.latest(footer).playState, "idle");
  assert.deepEqual([...h.observers[0].observed], [branch]);
});

test("Stale observer entries cannot revive cleared or newly registered nodes", () => {
  const h = fixture();
  const branch = h.node("branch", { origin: "center" });
  h.attach([branch]);
  h.motion.mount();
  const firstObserver = h.observers[0];
  firstObserver.emit(branch, true);
  h.motion.clear();
  assert.equal(h.latest(branch).playState, "idle");
  assert.equal(branch.style.transformOrigin, "center");
  assert.equal(firstObserver.disconnected, true);
  h.motion.mount();
  firstObserver.emit(branch, true);
  assert.equal(h.animations.length, 1);
  const currentObserver = h.observers[1];
  h.attach([]);
  h.motion.mount();
  h.attach([branch]);
  h.motion.mount();
  currentObserver.emit(branch, true, 2);
  assert.equal(h.animations.length, 1);
  currentObserver.emit(branch, true);
  assert.equal(h.animations.length, 2);
});

test("Missing observer or WAAPI keeps decorations static", () => {
  for (const withObserver of [false, true]) {
    const h = fixture({ withObserver });
    const branch = h.node("branch", { animate: !withObserver });
    h.attach([branch]);
    h.motion.mount();
    h.document.emit("visibilitychange");
    h.mediaQuery.emit("change");
    h.motion.setEnabled(true);
    assert.equal(h.animations.length, 0);
    assert.equal(h.observers.length, 0);
    assert.equal(branch.style.transformOrigin, "");
  }
});

test("Destroy cancels motion, removes listeners and makes future mounts inert", () => {
  const h = fixture();
  const cone = h.node("cone");
  h.attach([cone]);
  h.motion.mount();
  h.observers[0].emit(cone, true);
  h.motion.destroy();
  assert.equal(h.latest(cone).playState, "idle");
  assert.equal(h.observers[0].disconnected, true);
  assert.equal(h.document.listenerCount("visibilitychange"), 0);
  assert.equal(h.mediaQuery.listenerCount("change"), 0);
  h.observers[0].emit(cone, true);
  h.motion.mount();
  h.motion.setEnabled(true);
  h.motion.setSuspended(false);
  h.motion.destroy();
  assert.equal(h.animations.length, 1);
  assert.equal(h.observers.length, 1);
});

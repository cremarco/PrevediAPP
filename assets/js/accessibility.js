// Keep announcements outside the route DOM so updates do not reread a whole page.
export function createAnnouncer(
  region,
  schedule = setTimeout,
  cancel = clearTimeout,
) {
  let pending;
  return (message) => {
    cancel(pending);
    region.textContent = "";
    pending = schedule(() => {
      region.textContent = typeof message === "function" ? message() : message;
    }, 100);
  };
}

export function focusableElements(root) {
  return [
    ...root.querySelectorAll(
      "a[href],button,input,select,textarea,summary,[tabindex]",
    ),
  ].filter(
    (element) =>
      !element.disabled &&
      element.tabIndex >= 0 &&
      !element.closest("[hidden],[inert]") &&
      element.getClientRects().length > 0,
  );
}

export function createDrawerNavigation({
  document,
  drawer,
  trigger,
  panel,
  content,
  dock,
  toast,
  mediaQuery,
  scheduleFocus = requestAnimationFrame,
}) {
  let wasOpen = false;
  let recentFocus = document.activeElement;
  document.addEventListener("focusin", (event) => {
    if (event.target !== document.body) recentFocus = event.target;
  });
  function sync() {
    const active =
      document.activeElement === document.body
        ? recentFocus
        : document.activeElement;
    const mobile = !mediaQuery.matches;
    if (!mobile) drawer.checked = false;
    const open = mobile && drawer.checked;
    trigger.setAttribute("aria-expanded", String(open));
    panel.inert = mobile && !open;
    content.inert = open;
    dock.inert = open;
    toast.inert = open;
    if (open) {
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-label", "Navigazione principale");
      if (!wasOpen) {
        focusableElements(panel)[0]?.focus();
        // daisyUI may still hide the drawer's content until the next layout frame.
        if (!panel.contains(document.activeElement))
          scheduleFocus(() => {
            if (
              drawer.checked &&
              !mediaQuery.matches &&
              !panel.contains(document.activeElement)
            )
              focusableElements(panel)[0]?.focus();
          });
      }
    } else {
      panel.removeAttribute("role");
      panel.removeAttribute("aria-modal");
      panel.removeAttribute("aria-label");
      if (mobile && panel.contains(active)) trigger.focus();
      else if (
        !mobile &&
        panel.contains(active) &&
        !active.getClientRects().length
      )
        focusableElements(panel)[0]?.focus();
      else if (!mobile && (active === trigger || dock.contains(active)))
        focusableElements(panel)
          .find((element) => element.hasAttribute("aria-current"))
          ?.focus();
    }
    wasOpen = open;
  }
  function close(restore = true) {
    drawer.checked = false;
    sync();
    if (restore && !mediaQuery.matches) trigger.focus();
  }
  function keydown(event) {
    if (mediaQuery.matches || !drawer.checked) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    } else if (event.key === "Tab") {
      const controls = focusableElements(panel);
      const first = controls[0],
        last = controls.at(-1);
      if (!controls.length) return;
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          !panel.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !panel.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  mediaQuery.addEventListener("change", sync);
  return { sync, close, keydown };
}

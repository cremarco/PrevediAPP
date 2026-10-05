/** Owns the delayed demo reply so clearing/resetting cannot resurrect old messages. */
export function createConversation({
  store,
  respond,
  schedule = setTimeout,
  cancel = clearTimeout,
  onChange = () => {},
  onError = () => {},
}) {
  let busy = false;
  let pending = null;
  let generation = 0;

  function cancelPending() {
    generation++;
    if (pending !== null) cancel(pending);
    pending = null;
    busy = false;
  }

  return {
    get busy() {
      return busy;
    },
    cancelPending,
    send(value) {
      const text = String(value ?? "")
        .trim()
        .slice(0, 500);
      if (!text || busy) return false;
      store.state.chat.push({ role: "user", text });
      store.state.chat = store.state.chat.slice(-40);
      store.save();
      busy = true;
      const request = ++generation;
      onChange("sent");
      pending = schedule(async () => {
        if (request !== generation) return;
        pending = null;
        let outcome = "replied";
        try {
          const reply = await respond(text);
          if (request !== generation) return;
          store.state.chat.push({ role: "assistant", text: reply });
          store.state.chat = store.state.chat.slice(-40);
          store.save();
        } catch (error) {
          outcome = "failed";
          if (request === generation) onError(error);
        } finally {
          if (request === generation) {
            busy = false;
            onChange(outcome);
          }
        }
      }, 600);
      return true;
    },
    clear() {
      cancelPending();
      store.state.chat = [];
      store.save();
      onChange("cleared");
    },
  };
}

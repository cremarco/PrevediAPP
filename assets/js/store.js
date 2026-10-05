import { KEY, initialState, parseState } from "../data.js";

const READ_ERROR =
  "Le informazioni salvate non sono disponibili. Puoi continuare; esporta i tuoi dati dal profilo prima di chiudere.";
const WRITE_ERROR =
  "Non riesco a salvare su questo dispositivo. Le modifiche restano disponibili finché l’app è aperta: esportale dal profilo.";
const SYNC_ERROR =
  "Il salvataggio dell’altra scheda non è leggibile. Esporta una copia dal profilo.";

/** Storage access is injected so private-mode failures can be tested without a browser. */
export function createStore(getStorage) {
  let state = initialState();
  let problem = "";

  try {
    state = parseState(getStorage().getItem(KEY));
  } catch {
    problem = READ_ERROR;
  }

  return {
    get state() {
      return state;
    },
    get problem() {
      return problem;
    },
    save() {
      try {
        getStorage().setItem(KEY, JSON.stringify(state));
        problem = "";
      } catch {
        problem = WRITE_ERROR;
      }
      return !problem;
    },
    reset() {
      state = initialState();
    },
    replace(incoming) {
      // Validate and clone first: a failed replacement must leave current data intact.
      const next = parseState(JSON.stringify(incoming));
      state = next;
      return this.save();
    },
    sync(raw) {
      try {
        const incoming = parseState(raw);
        state = incoming;
        problem = "";
        return true;
      } catch {
        problem = SYNC_ERROR;
        return false;
      }
    },
  };
}

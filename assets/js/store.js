import { KEY, initialState, parseState } from "../data.js";

const ACCESS_ERROR =
  "Questo browser non permette di leggere i dati salvati. Le modifiche restano in memoria: esportale dal profilo prima di chiudere.";
const RECOVERY_ERROR =
  "Il salvataggio non è leggibile ed è stato protetto. Esporta il file originale, poi ripristina una copia valida oppure scegli un nuovo inizio.";
const EXISTING_ERROR =
  "È stato ritrovato un percorso già salvato. È protetto: scegli Recupera per usarlo, esporta il file originale oppure scegli un nuovo inizio.";
const WRITE_ERROR =
  "Non riesco a salvare in questo browser. Le modifiche restano disponibili finché l’app è aperta: esportale dal profilo.";
const RECOVERY_WRITE_ERROR =
  "Il browser non permette di sostituire il salvataggio. Il file originale è ancora protetto e i dati attuali non sono stati sostituiti. Esporta una copia prima di chiudere.";

/** Storage access is injected so private-mode failures can be tested without a browser. */
export function createStore(getStorage) {
  let state = initialState();
  let problem = "";
  let recoveryRaw = null;
  let recoveryReason = null;
  let storageUnavailable = false;
  let initialReadPending = true;

  function protect(raw, reason = "unreadable") {
    // Keep the first protected file unchanged, even if another tab writes later.
    recoveryRaw = raw;
    recoveryReason = reason;
    problem = reason === "existing" ? EXISTING_ERROR : RECOVERY_ERROR;
  }

  try {
    const raw = getStorage().getItem(KEY);
    initialReadPending = false;
    try {
      state = parseState(raw);
    } catch {
      protect(raw);
    }
  } catch {
    storageUnavailable = true;
    problem = ACCESS_ERROR;
  }

  function inspectStorage() {
    if (recoveryRaw !== null) return false;
    try {
      const storage = getStorage();
      // A denied initial read or a missed storage event must not let a save
      // overwrite a file discovered when storage becomes available.
      const raw = storage.getItem(KEY);
      storageUnavailable = false;
      try {
        parseState(raw);
      } catch {
        initialReadPending = false;
        protect(raw);
        return false;
      }
      if (initialReadPending && raw) {
        initialReadPending = false;
        protect(raw, "existing");
        return false;
      }
      initialReadPending = false;
      if (problem === ACCESS_ERROR) problem = "";
      return storage;
    } catch {
      storageUnavailable = true;
      problem = ACCESS_ERROR;
      return null;
    }
  }

  function write(next, recover = false) {
    try {
      const storage = recover ? getStorage() : inspectStorage();
      if (!storage) return false;
      storage.setItem(KEY, JSON.stringify(next));
      storageUnavailable = false;
      problem = "";
      if (recover) {
        recoveryRaw = null;
        recoveryReason = null;
        initialReadPending = false;
      }
      return true;
    } catch {
      storageUnavailable = true;
      problem = recoveryRaw !== null ? RECOVERY_WRITE_ERROR : WRITE_ERROR;
      return false;
    }
  }

  return {
    get state() {
      return state;
    },
    get problem() {
      return problem;
    },
    get recoveryRequired() {
      return recoveryRaw !== null;
    },
    get recoveryRaw() {
      return recoveryRaw;
    },
    get recoveryReason() {
      return recoveryReason;
    },
    get unreadableRaw() {
      return recoveryRaw;
    },
    get storageUnavailable() {
      return storageUnavailable;
    },
    prepareWrite() {
      // An inaccessible browser can still support temporary in-memory edits.
      // A protected file requires an explicit decision before any local mutation.
      return inspectStorage() !== false;
    },
    save() {
      return write(state);
    },
    reset() {
      const next = initialState();
      if (!write(next, true)) return false;
      state = next;
      return true;
    },
    replace(incoming) {
      // Validate, clone and persist before changing the in-memory state.
      if (!incoming || typeof incoming !== "object")
        throw new Error("Formato di salvataggio non valido.");
      const next = parseState(JSON.stringify(incoming));
      if (!write(next, true)) return false;
      state = next;
      return true;
    },
    recover() {
      if (recoveryReason !== "existing") return false;
      const next = parseState(recoveryRaw);
      if (!write(next, true)) return false;
      state = next;
      return true;
    },
    sync(raw) {
      if (recoveryRaw !== null) return false;
      try {
        const incoming = parseState(raw);
        state = incoming;
        initialReadPending = false;
        storageUnavailable = false;
        problem = "";
        return true;
      } catch {
        protect(raw);
        return false;
      }
    },
  };
}

const CHANGE_EVENT = "woklocal:local-list";

type StringListStoreOptions = {
  limit?: number;
};

export function createStringListStore(key: string, options: StringListStoreOptions = {}) {
  function get() {
    if (typeof window === "undefined") return [];

    const value = window.localStorage.getItem(key);
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  }

  function set(ids: string[]) {
    if (typeof window === "undefined") return;

    const uniqueIds = Array.from(new Set(ids)).slice(0, options.limit);
    window.localStorage.setItem(key, JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
  }

  function toggle(id: string) {
    const ids = get();
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [id, ...ids];
    set(next);
    return next.includes(id);
  }

  function prepend(id: string) {
    set([id, ...get().filter((item) => item !== id)]);
  }

  function subscribe(callback: () => void) {
    if (typeof window === "undefined") return () => {};

    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(CHANGE_EVENT, callback);
      window.removeEventListener("storage", callback);
    };
  }

  return {
    get,
    set,
    toggle,
    prepend,
    clear: () => set([]),
    has: (id: string) => get().includes(id),
    subscribe
  };
}

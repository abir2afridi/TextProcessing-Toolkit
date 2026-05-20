import { useCallback, useEffect, useState } from "react";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => {
    setValue(read<T>(key, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key],
  );
  return [value, set] as const;
}

export function useFavorites() {
  const [ids, setIds] = useLocalStorage<string[]>("tpt:favorites", []);
  const toggle = (id: string) =>
    setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return { favorites: ids, isFavorite: (id: string) => ids.includes(id), toggle };
}

export function useRecent() {
  const [ids, setIds] = useLocalStorage<string[]>("tpt:recent", []);
  const push = (id: string) =>
    setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  return { recent: ids, push };
}

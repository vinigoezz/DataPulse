import { useEffect, useState } from "react";

/** Devolve `value` só depois que ele parar de mudar por `ms` (ex.: busca enquanto digita). */
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}

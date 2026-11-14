import { useSyncExternalStore } from "react";
import type { Dataset } from "@/types";
import { DATASETS } from "@/mocks/datasets";

// Local, in-memory demo store. Replace with datasetsService + React Query once the backend exists.
let state: Dataset[] = DATASETS;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function useDatasets() {
  const datasets = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => state,
    () => DATASETS,
  );
  return {
    datasets,
    remove: (id: string) => { state = state.filter((d) => d.id !== id); emit(); },
    reset: () => { state = DATASETS; emit(); },
  };
}

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { datasetsApi } from "./api";
import type { RowsQuery } from "./types";

/** Chaves do cache do React Query: invalidar `all` atualiza tudo de datasets. */
export const datasetKeys = {
  all: ["datasets"] as const,
  list: () => [...datasetKeys.all, "list"] as const,
  detail: (id: string) => [...datasetKeys.all, "detail", id] as const,
  rows: (id: string, query: RowsQuery) => [...datasetKeys.all, "rows", id, query] as const,
  stats: (id: string) => [...datasetKeys.all, "stats", id] as const,
};

export function useDatasets() {
  return useQuery({ queryKey: datasetKeys.list(), queryFn: () => datasetsApi.list() });
}

export function useDataset(id: string) {
  return useQuery({ queryKey: datasetKeys.detail(id), queryFn: () => datasetsApi.get(id) });
}

export function useDatasetRows(id: string, query: RowsQuery) {
  return useQuery({
    queryKey: datasetKeys.rows(id, query),
    queryFn: () => datasetsApi.rows(id, query),
    // Mantém a página anterior na tela enquanto a próxima carrega (sem "piscar").
    placeholderData: keepPreviousData,
  });
}

export function useDatasetStats(id: string) {
  return useQuery({ queryKey: datasetKeys.stats(id), queryFn: () => datasetsApi.stats(id) });
}

export function useRemoveDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => datasetsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: datasetKeys.all }),
  });
}

export function useUploadDataset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, description }: { file: File; description?: string }) =>
      datasetsApi.upload(file, description),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: datasetKeys.list() }),
  });
}

export const isDemoMode = () => datasetsApi.mode === "demo";

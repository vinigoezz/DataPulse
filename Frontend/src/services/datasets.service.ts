import type { ColumnStats, Dataset, PaginatedRows, SaleRecord } from "@/types";
import { DATASETS } from "@/mocks/datasets";
import { SALES, SALES_COLUMNS } from "@/mocks/sales";
import { delay, http, isBackendConfigured } from "./http";

/**
 * Dataset service. Each method calls the FastAPI endpoint when VITE_API_URL is set,
 * otherwise returns local demo data. Contracts are provisional.
 */
export const datasetsService = {
  health: () => http<{ status: string }>("/api/health"),

  async list(): Promise<Dataset[]> {
    if (isBackendConfigured()) return http<Dataset[]>("/api/datasets");
    await delay(350);
    return DATASETS;
  },

  async rows(id: string, q: { page: number; pageSize: number }): Promise<PaginatedRows<SaleRecord>> {
    if (isBackendConfigured()) return http(`/api/datasets/${id}/rows?page=${q.page}&page_size=${q.pageSize}`);
    await delay(200);
    return { rows: SALES, total: SALES.length, page: q.page, pageSize: q.pageSize };
  },

  async stats(id: string): Promise<ColumnStats[]> {
    if (isBackendConfigured()) return http(`/api/datasets/${id}/stats`);
    await delay(200);
    return SALES_COLUMNS.map((c) => {
      const vals = SALES.map((r) => r[c.key as keyof SaleRecord]);
      const nums = vals.filter((v): v is number => typeof v === "number");
      const s: ColumnStats = { key: c.key, label: c.label, type: c.type, nulls: vals.filter((v) => v === null || v === "").length, distinct: new Set(vals).size };
      if (nums.length && (c.type === "número" || c.type === "moeda")) {
        s.min = Math.min(...nums);
        s.max = Math.max(...nums);
        s.mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      }
      return s;
    });
  },

  /** Requires backend: POST /api/datasets/upload */
  async upload(file: File): Promise<Dataset> {
    const body = new FormData();
    body.append("file", file);
    return http<Dataset>("/api/datasets/upload", { method: "POST", body });
  },
};

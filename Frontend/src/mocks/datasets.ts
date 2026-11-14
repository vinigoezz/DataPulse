import type { Dataset, ReportItem } from "@/types";
import { SALES } from "./sales";

export const DATASETS: Dataset[] = [
  { id: "ds-vendas-2026", name: "vendas_2026.csv", importedAt: "2026-11-12T14:32:00", rows: SALES.length, columns: 11, sizeBytes: 148_320, status: "processado", description: "Vendas consolidadas por filial, produto e canal." },
  { id: "ds-faturamento-tri", name: "faturamento_trimestral.csv", importedAt: "2026-11-10T09:12:00", rows: 2_480, columns: 9, sizeBytes: 412_880, status: "processado", description: "Faturamento agregado por trimestre e unidade de negócio." },
  { id: "ds-despesas", name: "despesas_operacionais.csv", importedAt: "2026-11-08T17:45:00", rows: 18_734, columns: 14, sizeBytes: 3_284_110, status: "processando", description: "Lançamentos de despesas operacionais por centro de custo." },
  { id: "ds-folha", name: "folha_pagamento.csv", importedAt: "2026-11-03T11:05:00", rows: 1_214, columns: 22, sizeBytes: 862_400, status: "processado", description: "Folha de pagamento mensal com encargos e benefícios." },
  { id: "ds-clientes", name: "clientes_ativos.csv", importedAt: "2026-10-28T08:20:00", rows: 46_512, columns: 17, sizeBytes: 12_904_300, status: "erro", description: "Base de clientes ativos com segmentação e LTV." },
  { id: "ds-estoque", name: "estoque_centros.csv", importedAt: "2026-10-21T15:40:00", rows: 9_870, columns: 12, sizeBytes: 1_740_000, status: "pendente", description: "Posição de estoque por centro de distribuição." },
];

export const REPORTS: ReportItem[] = [
  { id: "rp-1", name: "Desempenho comercial — Outubro", datasetId: "ds-vendas-2026", createdAt: "2026-11-02T10:00:00", type: "Comercial", author: "Marina Duarte" },
  { id: "rp-2", name: "Fechamento financeiro Q3", datasetId: "ds-faturamento-tri", createdAt: "2026-10-15T16:20:00", type: "Financeiro", author: "Marina Duarte" },
  { id: "rp-3", name: "Custos operacionais por centro", datasetId: "ds-despesas", createdAt: "2026-10-09T09:40:00", type: "Operacional", author: "Rafael Teixeira" },
  { id: "rp-4", name: "Ranking de filiais 2026", datasetId: "ds-vendas-2026", createdAt: "2026-09-30T14:10:00", type: "Desempenho", author: "Marina Duarte" },
  { id: "rp-5", name: "Evolução da folha — semestre", datasetId: "ds-folha", createdAt: "2026-09-12T11:00:00", type: "Financeiro", author: "Juliana Prado" },
];

export const CURRENT_USER = { name: "Marina Duarte", email: "marina.duarte@empresa.com.br", role: "Analista de Dados", initials: "MD" };

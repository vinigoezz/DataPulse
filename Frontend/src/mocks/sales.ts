import type { ColumnSchema } from "@/features/datasets/types";
import type { SaleRecord } from "@/types";
import { mulberry32, pick } from "./rng";

export const FILIAIS = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Porto Alegre",
  "Recife",
];
export const CANAIS = ["E-commerce", "Loja física", "Marketplace", "B2B"];
export const VENDEDORES = [
  "Ana Souza",
  "Bruno Lima",
  "Carla Mendes",
  "Diego Rocha",
  "Elisa Martins",
  "Felipe Alves",
  "Gabriela Nunes",
  "Henrique Costa",
];

export const PRODUTOS: { produto: string; categoria: string; preco: number; margem: number }[] = [
  { produto: "Notebook Pro 14", categoria: "Eletrônicos", preco: 6890, margem: 0.22 },
  { produto: "Smartphone X12", categoria: "Eletrônicos", preco: 3290, margem: 0.25 },
  { produto: "Monitor UltraWide 34", categoria: "Eletrônicos", preco: 2490, margem: 0.28 },
  { produto: "Fone Bluetooth ANC", categoria: "Acessórios", preco: 890, margem: 0.42 },
  { produto: "Teclado Mecânico", categoria: "Acessórios", preco: 540, margem: 0.45 },
  { produto: "Mouse Ergonômico", categoria: "Acessórios", preco: 260, margem: 0.48 },
  { produto: "Cadeira Executiva", categoria: "Mobiliário", preco: 1890, margem: 0.35 },
  { produto: "Mesa Regulável", categoria: "Mobiliário", preco: 2790, margem: 0.32 },
  { produto: "Licença Office Anual", categoria: "Software", preco: 420, margem: 0.6 },
  { produto: "Antivírus Empresarial", categoria: "Software", preco: 310, margem: 0.65 },
  { produto: "Instalação Técnica", categoria: "Serviços", preco: 650, margem: 0.55 },
  { produto: "Suporte Premium", categoria: "Serviços", preco: 1200, margem: 0.58 },
];

export const CATEGORIAS = Array.from(new Set(PRODUTOS.map((p) => p.categoria)));

export const SALES_COLUMNS: ColumnSchema[] = [
  { key: "id", label: "ID", type: "texto" },
  { key: "data", label: "Data", type: "data" },
  { key: "filial", label: "Filial", type: "categoria" },
  { key: "categoria", label: "Categoria", type: "categoria" },
  { key: "produto", label: "Produto", type: "texto" },
  { key: "vendedor", label: "Vendedor", type: "texto" },
  { key: "canal", label: "Canal", type: "categoria" },
  { key: "quantidade", label: "Qtd.", type: "número" },
  { key: "receita", label: "Receita", type: "moeda" },
  { key: "custo", label: "Custo", type: "moeda" },
  { key: "desconto", label: "Desconto %", type: "número" },
];

function generate(): SaleRecord[] {
  const rand = mulberry32(20260101);
  const out: SaleRecord[] = [];
  const start = new Date(Date.UTC(2025, 10, 1)); // Nov 2025 → Oct 2026 (12 months)
  let n = 1;
  for (let m = 0; m < 12; m++) {
    const seasonal = 1 + 0.18 * Math.sin((m / 12) * Math.PI * 2 + 0.6) + m * 0.025;
    const count = Math.round(95 * seasonal);
    for (let i = 0; i < count; i++) {
      const p = pick(PRODUTOS, rand());
      const day = 1 + Math.floor(rand() * 28);
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + m, day));
      const qtd = 1 + Math.floor(rand() * (p.preco > 2000 ? 4 : 12));
      const desconto = rand() < 0.08 ? null : Math.round(rand() * 12);
      const receita = Math.round(p.preco * qtd * (1 - (desconto ?? 0) / 100) * 100) / 100;
      const custo = Math.round(p.preco * qtd * (1 - p.margem) * 100) / 100;
      out.push({
        id: `VD-${String(n++).padStart(5, "0")}`,
        data: d.toISOString().slice(0, 10),
        filial: pick(FILIAIS, Math.pow(rand(), 1.4)),
        categoria: p.categoria,
        produto: p.produto,
        vendedor: pick(VENDEDORES, rand()),
        quantidade: qtd,
        receita,
        custo,
        canal: pick(CANAIS, Math.pow(rand(), 0.9)),
        desconto,
      });
    }
  }
  return out.sort((a, b) => b.data.localeCompare(a.data));
}

export const SALES: SaleRecord[] = generate();

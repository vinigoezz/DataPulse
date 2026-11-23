import type { ColumnType, ValueRange } from "../types";
import { formatValue } from "./format-value";

const BR_NUMBER = /^[+-]?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?$/;
const PLAIN_NUMBER = /^[+-]?\d+(\.\d+)?$/;

/**
 * O que a pessoa digitou → valor que a API entende. "" continua "" (lado aberto);
 * null quer dizer "não é um valor válido".
 * Números aceitam "1.234,56" ou "1234.56"; percentuais são digitados como na tela (15 = 15%).
 */
export function toApiValue(input: string, type: ColumnType): string | null {
  const text = input.trim();
  if (text === "") return "";
  if (type === "data") return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
  const number = parseNumber(text);
  if (number === null) return null;
  return String(type === "percentual" ? number / 100 : number);
}

/** Valor da API → texto para mostrar no campo de digitação (o inverso de toApiValue). */
export function toInputValue(api: string, type: ColumnType): string {
  if (api === "" || type === "data") return api;
  const number = Number(api);
  const shown = type === "percentual" ? Math.round(number * 1e6) / 1e4 : number;
  return String(shown).replace(".", ",");
}

/** "R$ 100,00 a R$ 500,00", "a partir de 15,0%", "até 31/01/2026". */
export function describeRange({ min, max }: ValueRange, type: ColumnType): string {
  const show = (api: string) => formatValue(type === "data" ? api : Number(api), type);
  if (min !== "" && max !== "") return `${show(min)} a ${show(max)}`;
  if (min !== "") return `a partir de ${show(min)}`;
  return `até ${show(max)}`;
}

function parseNumber(text: string): number | null {
  if (PLAIN_NUMBER.test(text)) return Number(text);
  if (BR_NUMBER.test(text)) return Number(text.replace(/\./g, "").replace(",", "."));
  return null;
}

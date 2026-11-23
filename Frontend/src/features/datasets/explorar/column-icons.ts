import { Calendar, DollarSign, Hash, Percent, Tag, Type } from "lucide-react";
import type { ColumnType } from "../types";

export const COLUMN_ICON: Record<ColumnType, typeof Hash> = {
  número: Hash,
  moeda: DollarSign,
  percentual: Percent,
  data: Calendar,
  categoria: Tag,
  texto: Type,
};

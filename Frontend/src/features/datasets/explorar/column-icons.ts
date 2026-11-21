import { Calendar, DollarSign, Hash, Tag, Type } from "lucide-react";
import type { ColumnType } from "../types";

export const COLUMN_ICON: Record<ColumnType, typeof Hash> = {
  número: Hash,
  moeda: DollarSign,
  data: Calendar,
  categoria: Tag,
  texto: Type,
};

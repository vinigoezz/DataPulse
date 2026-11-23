import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/layout/PageHeader";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useDatasetRows, useDatasetStats } from "../queries";
import type { Dataset, ValueRange } from "../types";
import { ColumnProfile } from "./ColumnProfile";
import { NumericSummary } from "./NumericSummary";
import { Pagination } from "./Pagination";
import { INITIAL_QUERY, nextSort, refine } from "./rows-query-state";
import { RowsTable } from "./RowsTable";
import { RowsToolbar } from "./RowsToolbar";

/** Linhas e estatísticas de um dataset. Recriado (key) ao trocar de dataset, zerando a consulta. */
export function DatasetExplorer({ dataset }: { dataset: Dataset }) {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);

  useEffect(() => {
    setQuery((q) => (q.search === search ? q : refine(q, { search })));
  }, [search]);

  const stats = useDatasetStats(dataset.id);
  const rows = useDatasetRows(dataset.id, query);

  if (stats.isError || rows.isError) {
    const retry = () => Promise.all([stats.refetch(), rows.refetch()]);
    return (
      <div className="surface-card">
        <ErrorState
          title="Não foi possível carregar este dataset"
          error={stats.error ?? rows.error}
          onRetry={retry}
        />
      </div>
    );
  }

  const columns = stats.data;
  const page = rows.data;
  const setFilter = (column: string, value: string) =>
    setQuery((q) => refine(q, { filters: { ...q.filters, [column]: value } }));
  const setRange = (column: string, range: ValueRange) =>
    setQuery((q) => refine(q, { ranges: { ...q.ranges, [column]: range } }));
  const clearAll = () => {
    setSearchInput("");
    setQuery(INITIAL_QUERY);
  };

  return (
    <>
      <NumericSummary stats={columns} />

      <section className="surface-card overflow-hidden">
        <RowsToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          filters={query.filters}
          columns={columns ?? []}
          onClearFilter={(column) => setFilter(column, "")}
          ranges={query.ranges}
          onClearRange={(column) => setRange(column, { min: "", max: "" })}
          total={page?.total}
          fetching={rows.isFetching}
        />

        {!columns || !page ? (
          <div className="space-y-2 p-4" aria-busy="true" aria-label="Carregando linhas">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : page.rows.length === 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title="Nenhum registro encontrado"
            description="Tente outro termo de busca ou remova filtros."
            action={
              <Button variant="soft" onClick={clearAll}>
                Limpar busca e filtros
              </Button>
            }
          />
        ) : (
          <RowsTable
            columns={columns}
            rows={page.rows}
            firstRowNumber={(query.page - 1) * query.pageSize + 1}
            query={query}
            onToggleSort={(column) =>
              setQuery((q) => refine(q, { sort: nextSort(q.sort, column) }))
            }
            onFilter={setFilter}
            onRange={setRange}
          />
        )}

        <Pagination
          page={query.page}
          pageSize={query.pageSize}
          total={page?.total ?? 0}
          onPageChange={(p) => setQuery((q) => ({ ...q, page: p }))}
          onPageSizeChange={(pageSize) => setQuery((q) => refine(q, { pageSize }))}
        />
      </section>

      {columns && <ColumnProfile stats={columns} />}
    </>
  );
}

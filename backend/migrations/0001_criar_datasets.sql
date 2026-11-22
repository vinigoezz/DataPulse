-- Catálogo de datasets: os metadados de cada arquivo importado.
-- Os dados em si (Parquet) ficam no armazenamento de arquivos, não aqui.
create table datasets (
    id                text primary key,
    name              text not null,
    description       text not null default '',
    original_filename text not null,
    imported_at       timestamptz not null,
    row_count         integer not null,
    column_count      integer not null,
    size_bytes        bigint not null,
    status            text not null
        check (status in ('processado', 'processando', 'erro', 'pendente')),
    csv_separator     text not null,
    csv_encoding      text not null
);

create index datasets_imported_at_idx on datasets (imported_at desc);

-- Só a API (que conecta com o usuário dono do banco) lê e escreve aqui.
-- Com RLS ligado e nenhuma regra, ninguém de fora acessa a tabela, nem com a chave
-- pública do Supabase. É Postgres padrão, então vale em qualquer provedor.
alter table datasets enable row level security;

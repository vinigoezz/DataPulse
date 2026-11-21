# Passo 2 — Backend organizado em vertical slices

## O que é “vertical slice” (fatia vertical)

Imagine duas formas de arrumar uma cozinha:

- **Por tipo de objeto** (o jeito antigo): uma gaveta só de facas, outra só de colheres, outra só
  de panelas. Para fazer um bolo você abre todas as gavetas.
- **Por receita** (vertical slice): uma caixa “bolo” com a forma, a batedeira e a espátula; outra
  caixa “café” com o coador e o pó. Para fazer um bolo você abre **uma caixa só**.

O backend estava organizado do primeiro jeito, com pastas técnicas:

```
api/routes/   ← as “portas de entrada” de todas as funcionalidades
services/     ← as regras de todas as funcionalidades
schemas/      ← os formatos de dados de todas as funcionalidades
storage/      ← o armazenamento
```

Para entender ou mudar a **importação de planilhas**, era preciso abrir quatro pastas diferentes.

Agora está organizado do segundo jeito: **uma pasta por funcionalidade**.

```
backend/app/
├── main.py                 ← liga tudo (não tem regra de negócio)
├── shared/                 ← o que qualquer funcionalidade pode usar
│   ├── config.py           ← configurações (limite de upload, pasta de dados...)
│   ├── errors.py           ← tipos de erro e o código HTTP de cada um
│   └── api_model.py        ← padrão dos dados que saem da API
└── features/
    ├── health/             ← “a API está viva?”
    └── datasets/
        ├── importar/       ← enviar uma planilha
        ├── listar/         ← ver todas as planilhas
        ├── obter/          ← ver uma planilha
        ├── remover/        ← apagar uma planilha
        ├── linhas/         ← ver as linhas, página por página
        ├── estatisticas/   ← tipo e estatísticas de cada coluna
        ├── models.py       ← o que é um “Dataset” (usado por várias fatias)
        ├── errors.py       ← erros de datasets (“não encontrado”, “arquivo inválido”...)
        ├── repository.py   ← onde as planilhas ficam guardadas
        └── dependencies.py ← entrega o “guarda-volumes” a cada fatia
```

## Por que isso é melhor

1. **Achar as coisas é fácil:** “onde fica a paginação?” Em `datasets/linhas/`. Tudo ali.
2. **Mudar é seguro:** alterar a importação não tem como quebrar a listagem, porque uma fatia não
   usa o código de outra.
3. **Crescer é previsível:** a próxima funcionalidade (por exemplo, o dashboard) vira uma pasta
   nova, sem mexer nas existentes.
4. **Combina com o futuro:** quando trocarmos o disco pelo Supabase, só o `repository.py` muda.
   Nenhuma fatia precisa saber onde os dados moram.

## O que tem dentro de uma fatia

Pegando a maior delas, `importar/`:

| Arquivo | Papel, em linguagem simples |
| --- | --- |
| `endpoint.py` | O **balcão de atendimento**: recebe o arquivo pela internet e entrega ao caso de uso. Não sabe ler CSV. |
| `caso_de_uso.py` | O **gerente**: confere o formato, copia o arquivo respeitando o limite de tamanho, manda ler, monta a ficha do dataset e manda guardar. Não sabe nada de internet. |
| `leitura_csv.py` | O **especialista em arquivos**: abre CSV, .zip e .gz, descobre a codificação (acentos) e o separador (`,` ou `;`). |
| `datas.py` | O **especialista em datas**: descobre quais colunas são datas (como `05/01/2026`) e converte. |

Separar “balcão” de “gerente” permite testar a regra de importação sem simular a internet, e trocar
o balcão no futuro (por exemplo, receber do Supabase Storage) sem reescrever a regra.

## Regras que combinamos (para manter organizado)

1. Uma fatia **não usa** código de outra fatia. Se duas precisam da mesma coisa, ela sobe um nível
   (para `models.py`, por exemplo).
2. Um formato de dados mora **com quem usa**. O formato “página de linhas” só existe em `linhas/`.
3. O `endpoint.py` é **fino**: só traduz entre internet e Python.
4. Cada erro “herda” de uma categoria em `shared/errors.py`, e a categoria define o código HTTP
   (404 = não encontrado, 422 = arquivo inválido, 413 = grande demais). Antes, o `main.py` precisava
   conhecer cada erro de cada funcionalidade; agora não precisa.

## O que **não** mudou

- **Nenhum endereço da API mudou.** O Frontend continua funcionando igual.
- **O comportamento é o mesmo.** Os testes antigos foram mantidos (apenas redistribuídos) e
  continuam passando.
- O histórico de cada arquivo foi preservado no git (movemos com `git mv` em vez de apagar e
  recriar).

## Arquivos alterados

- Movidos: `core/*` → `shared/`; `api/routes/health.py` → `features/health/endpoint.py`;
  `services/ingestion.py` → `features/datasets/importar/leitura_csv.py` (+ `datas.py`);
  `services/profiling.py` → `features/datasets/estatisticas/perfil.py`;
  `services/datasets.py` → `features/datasets/importar/caso_de_uso.py`;
  `schemas/datasets.py` → `features/datasets/models.py` (formatos específicos foram para as fatias);
  `storage/repository.py` → `features/datasets/repository.py`
- Novos: um `endpoint.py` por fatia, `shared/api_model.py`, `features/datasets/errors.py`
- Removidos: as pastas antigas `api/`, `core/`, `schemas/`, `services/`, `storage/`

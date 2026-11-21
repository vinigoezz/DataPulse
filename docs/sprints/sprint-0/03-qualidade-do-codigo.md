# Passo 3 — Qualidade do código (clean code)

**Clean code** é escrever código que outra pessoa (ou você daqui a seis meses) entende de primeira.
As ideias principais: nomes que dizem o que a coisa faz, funções pequenas com uma tarefa só, nada
repetido e nada sobrando.

## 3.1 Melhorias feitas durante a reorganização

| Antes | Depois | Por quê |
| --- | --- | --- |
| A mesma mensagem “Não foi possível abrir o arquivo compactado” escrita 3 vezes | Uma função `_arquivo_compactado_invalido` e uma lista `ERROS_DE_COMPACTACAO` | Se a mensagem mudar, muda num lugar só. |
| `Dataset.model_validate(meta.model_dump())` repetido em 4 lugares | Um método com nome claro: `meta.publico()` | Diz **o que** faz (“a versão pública da ficha”), não **como**. |
| O importador recebia 5 parâmetros soltos | Um “pedido” só: `PedidoDeImportacao` | Fica difícil trocar a ordem dos parâmetros por engano. |
| Uma classe `DatasetService` que fazia de tudo | Cada fatia faz só a sua parte; listar e apagar falam direto com o repositório | Não existe mais um “faz-tudo” que cresce sem parar. |
| `max_upload_bytes`, configuração que ninguém mais usava | Removida | Código sobrando confunde quem lê. |
| Leitura de CSV e detecção de datas no mesmo arquivo de 170 linhas | Dois arquivos: `leitura_csv.py` e `datas.py` | Cada arquivo tem um assunto. |

## 3.2 Um “corretor ortográfico” para código: ruff

Instalamos o **ruff**, que lê o código e aponta problemas automaticamente:

- importações que não são usadas;
- nomes que não existem (erros de digitação);
- linhas longas demais;
- armadilhas comuns do Python;
- formatação (espaços, quebras de linha) sempre no mesmo padrão.

As regras ficam em `backend/pyproject.toml`. Para usar:

```bash
make lint     # só aponta os problemas
make format   # corrige sozinho o que dá
```

Hoje o backend passa sem nenhum aviso.

> **Sobre o Frontend:** o `make lint` também confere o Frontend e hoje acusa cerca de 340 avisos,
> quase todos de **formatação** (espaços e quebras de linha) no código gerado pelo Lovable. Não é
> erro de funcionamento. Vamos corrigir no Sprint 1, junto com a reorganização do Frontend, para
> não misturar milhares de linhas de formatação com as mudanças deste sprint.

## 3.3 Testes organizados por fatia

Antes havia um arquivo grande que testava tudo em sequência. Se a primeira parte falhasse, você não
sabia se o resto funcionava. Agora os testes espelham as pastas do código:

```
backend/tests/
├── conftest.py                 ← preparação comum: uma API de teste e um dataset de vendas pronto
└── features/
    ├── health/test_health.py
    └── datasets/
        ├── test_importar.py    ← CSV, .zip, .gz, separador, arquivos inválidos e grandes demais
        ├── test_listar.py
        ├── test_obter.py       ← inclusive tentativa de acessar pastas proibidas
        ├── test_remover.py
        ├── test_linhas.py
        ├── test_estatisticas.py
        └── test_datas.py
```

**Resultado:** 18 testes passando (eram 8). Não é que o sistema tenha mudado: o mesmo conteúdo foi
dividido em testes menores, cada um com nome dizendo o que verifica (por exemplo,
`test_recusa_arquivos_invalidos_sem_criar_dataset`), e ganhamos testes novos para o redirecionamento
de `/` e para o 404 de cada endereço.

Cada teste cria uma pasta temporária própria, então rodar os testes nunca mexe nos seus dados reais.

## Arquivos alterados

- `backend/pyproject.toml` (novo): configuração do ruff e dos testes
- `backend/requirements-dev.txt`: adicionado o `ruff`
- `backend/tests/`: reorganizado por fatia

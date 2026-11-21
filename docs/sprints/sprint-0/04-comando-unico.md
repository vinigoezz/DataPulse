# Passo 4 — Um comando para tudo (Makefile)

## O problema

Para trabalhar no projeto era preciso lembrar de vários comandos diferentes, em pastas diferentes:
criar o ambiente Python, instalar pacotes, entrar em `backend/` e ligar a API, abrir outro terminal,
entrar em `Frontend/` e ligar o site... Fácil de errar e chato de explicar para outra pessoa.

## A solução: o `Makefile`

Um **Makefile** é uma lista de atalhos. Cada atalho tem um nome curto e executa os comandos longos
por você. Ele fica na raiz do projeto.

| Comando | O que faz |
| --- | --- |
| `make` | Mostra a lista de atalhos com uma explicação de cada um. |
| `make setup` | Instala tudo: cria o ambiente Python (`.venv`), instala os pacotes da API e do Frontend e cria o `Frontend/.env.local` (que diz ao site onde está a API). Rode uma vez. |
| `make dev` | **Liga a API e o site ao mesmo tempo.** `Ctrl+C` desliga os dois. |
| `make api` | Liga só a API. A documentação interativa fica em http://localhost:8000/docs. |
| `make web` | Liga só o site. O endereço aparece no terminal. |
| `make test` | Roda os testes da API e do Frontend. |
| `make lint` | Confere a qualidade do código. |
| `make format` | Arruma a formatação do código da API automaticamente. |

## Um detalhe: abrir `localhost:8000` agora leva à documentação

Antes, abrir o endereço da API sem nada depois mostrava um erro “Not Found”. Agora ele redireciona
para `/docs`, a página onde dá para ver e testar cada endpoint pelo navegador. Isso já estava
pronto antes deste sprint e ganhou um teste.

## Situação atual

- `make setup`, `make api`, `make web` e `make test` funcionam.
- `make lint` passa no backend; no Frontend ainda acusa avisos de formatação (ver passo 3).

## Arquivos alterados

- `Makefile` (novo)
- `README.md`: a seção “Como rodar” agora usa os atalhos

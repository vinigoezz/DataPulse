# Passo 1 — Arrumação de arquivos

## 1.1 Documento de arquitetura cortado

**O problema:** o arquivo `docs/ARQUITETURA.md` terminava com a frase “quando houver vários usuári”,
cortada no meio. Provavelmente foi um salvamento interrompido.

**O que fizemos:** completamos a frase. Depois, no passo 5, o documento foi atualizado por inteiro.

## 1.2 Um só “instalador” para o Frontend

**Contexto para leigos:** o Frontend usa centenas de pacotes prontos, feitos por outras pessoas
(bibliotecas de gráficos, botões etc.). Um **gerenciador de pacotes** baixa esses pacotes e anota
num arquivo, chamado **lockfile**, a versão exata de cada um. Assim todo computador instala
exatamente as mesmas versões, como uma receita com a marca de cada ingrediente.

**O problema:** havia dois gerenciadores competindo:

- o **bun**, usado pelo Lovable, que anota as versões no `bun.lock`;
- o **npm**, que alguém rodou neste computador e que criou um `package-lock.json` no Frontend e
  outro, vazio, na raiz do projeto.

Duas receitas para o mesmo bolo podem divergir com o tempo, e a Vercel não saberia qual seguir.

**O que fizemos:**

1. Escolhemos o **bun**, porque é o que o Lovable usa e mantém atualizado.
2. Instalamos o bun neste computador e conferimos que o `bun.lock` instala tudo sem divergência.
3. Pedimos ao git que **ignore** qualquer `package-lock.json` (regra no `.gitignore`), para que
   ele nunca seja salvo no histórico por engano.

> **Para você fazer:** os dois `package-lock.json` ainda existem no disco (agora ignorados). Pode
> apagá-los com `rm package-lock.json Frontend/package-lock.json`. Não apaguei sozinho porque
> apagar arquivos é uma decisão sua.

## 1.3 A pasta do Frontend que estava sumida (achado importante)

**O problema:** ao rodar os testes do Frontend, eles falharam dizendo que não encontravam
`@/lib/utils`, `@/lib/analytics`, `@/lib/theme` e outros. A pasta `Frontend/src/lib/` **não existe**
neste repositório, mas o código usa essa pasta em mais de 60 lugares. Ou seja: o Frontend, como está
no GitHub, **não compila**.

**A causa:** o arquivo `.gitignore` (a lista de “arquivos que o git deve fingir que não vê”) foi
criado a partir de um modelo pronto para projetos Python. Esse modelo tem a linha `lib/`, que em
Python serve para esconder pastas geradas automaticamente. Só que a regra valia para **qualquer**
pasta chamada `lib` em qualquer lugar do projeto, inclusive `Frontend/src/lib/`, que é código
de verdade. Quando o Frontend foi copiado para cá, essa pasta foi silenciosamente deixada de fora.

**O que fizemos:** trocamos `lib/` por `/lib/`. A barra no começo quer dizer “só na raiz do
projeto”. Agora `Frontend/src/lib/` pode ser salva normalmente.

**Resolvido:** os arquivos foram copiados do Lovable para `Frontend/src/lib/`: `analytics.ts`,
`error-capture.ts`, `error-page.ts`, `format.ts`, `lovable-error-reporting.ts`, `theme.tsx` e
`utils.ts`. Conferimos de três formas:

- **Testes** (`make test`): 18 da API e 3 do Frontend, todos passando.
- **Checagem de tipos** (`tsc`): o TypeScript confere se cada peça do código encaixa nas outras,
  como conferir se todas as peças de um quebra-cabeça têm par. Nenhum erro.
- **Build** (`bun run build`): gerar a versão final do site, a mesma que vai para a hospedagem.
  Concluído sem erros.

## Arquivos alterados

- `docs/ARQUITETURA.md`: frase completada
- `.gitignore`: ignora `package-lock.json`; `lib/` virou `/lib/`

import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Data Pulse AI (em breve) — Data Pulse" },
      { name: "description", content: "Converse com seus dados em linguagem natural. Em breve no Data Pulse." },
      { property: "og:title", content: "Data Pulse AI — Em breve" },
      { property: "og:description", content: "Converse com seus dados em linguagem natural. Em breve no Data Pulse." },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "Qual filial teve o maior crescimento no último trimestre?",
  "Compare a margem de lucro entre e-commerce e loja física.",
  "Quais produtos têm o maior ticket médio?",
  "Mostre a evolução das despesas operacionais em 2026.",
];

function AssistantPage() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center gap-8 py-10 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-10 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="relative space-y-4">
        <LogoMark className="mx-auto size-14 rounded-2xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"><Sparkles className="size-3" /> Data Pulse AI · Em breve</span>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Converse com seus dados.</h1>
        <p className="mx-auto max-w-lg text-muted-foreground">Em breve, você poderá fazer perguntas em linguagem natural e receber respostas baseadas nas suas análises.</p>
      </div>
      <div className="relative grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <div key={s} className="surface-card p-4 text-left text-sm text-muted-foreground">{s}</div>
        ))}
      </div>
      <div className="surface-card relative flex w-full items-center gap-2 p-2 opacity-60" aria-disabled>
        <input disabled placeholder="Pergunte algo sobre seus dados… (indisponível)" className="h-10 flex-1 bg-transparent px-3 text-sm outline-none" aria-label="Campo indisponível" />
        <span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground"><ArrowUp className="size-4" /></span>
      </div>
      <p className="relative text-xs text-muted-foreground">As sugestões acima são apenas exemplos. Nenhuma resposta é gerada nesta versão.</p>
    </div>
  );
}

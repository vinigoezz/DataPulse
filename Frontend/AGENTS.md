<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.

<!-- LOVABLE:END -->

## Data Pulse architecture

- Frontend only: no Lovable Cloud/backend; the FastAPI API lives in `../backend` (see `../docs/ARQUITETURA.md`). Code is organized in vertical slices under `src/features/<feature>/<slice>/`; route files in `src/routes/` stay thin. Each feature reaches data through its `api/` folder (HTTP via `src/lib/http.ts` when `VITE_API_URL` is set, demo data from `src/mocks/` otherwise) and React Query hooks in `queries.ts`. API contracts in `src/features/datasets/types.ts` mirror `backend/app/features/datasets/`; change both together.
- Demo data is generated with a seeded PRNG (`src/mocks/rng.ts`) so numbers never change between reloads.
- Theme is a `.dark` class on `<html>` managed by `src/lib/theme.tsx` (dark default, persisted in localStorage) — no next-themes.
- Recharts axes must be direct children of the chart (no fragments), or they silently don't render.

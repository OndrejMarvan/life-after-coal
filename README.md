# Life After Coal · Život po uhlí · Życie po węglu

A website that brings together every support programme for miners and their families in Czech and Polish Silesia. A miner answers a few questions and sees what applies to them, what does not and why, and what to do next.

Built for the Club Alpbach Design Thinking Hackathon, "Life Beyond Coal" challenge.

## What is inside

| Feature | Where |
|---|---|
| Wizard "Check what you can get" with likely / check / not-for-you results, personal route with a mine-lift progress bar, Czech 6-month countdown and allowance estimate | `src/pages/Check.tsx`, rules in `src/data/rules.ts` |
| Programme directory and pages (75 entries: 44 Poland, 31 Czechia, plus EURES) with evidence badges and last-checked dates | `src/pages/Programmes.tsx`, `src/pages/Programme.tsx` |
| Apply online or in person (help points per programme) | programme page sidebar |
| Interactive map: help points, mines, events (Leaflet + OpenStreetMap) | `src/pages/MapPage.tsx`, `src/data/places.ts` |
| Calendar of deadlines, law changes and mine milestones, with .ics download and event suggestions | `src/pages/Calendar.tsx`, `src/data/events.ts` |
| "Need to talk?" hotline page with callback form and official phone lines | `src/pages/Hotline.tsx` |
| Help for children (honest empty state plus suggestion form) | `src/pages/Children.tsx` |
| Newsletter sign-up, monthly digest as printable A4 and email HTML | `src/pages/Newsletter.tsx`, `src/pages/Digest.tsx` |
| Discussion forum with replies, votes, reports, sharing, moderation | `src/pages/Forum.tsx`, `src/pages/ForumPost.tsx` |
| Stories and history: timeline of past closures, lessons, moderated personal stories | `src/pages/Stories.tsx` |
| AI assistant answering only from the programme database, citing cards | `src/pages/Assistant.tsx`, `api/assistant.ts` |
| Accounts, dashboard (saved programmes, route, deadlines, application tracker) | `src/pages/Account.tsx` |
| Admin: edit programmes and translations, CSV/JSON import, events, callbacks, subscribers, digest, moderation, re-check list, suggestions | `src/pages/Admin.tsx` |
| Official portals, "mentioned but not confirmed" list, gaps page with exclusion tables | `src/pages/Portals.tsx`, `src/pages/Gaps.tsx` |
| "Buy us a coffee" crowdfunding page and footer button (placeholder: no payment method connected yet) | `src/pages/Support.tsx` |

Languages: Czech, Polish and English for the whole interface (`src/i18n`). Programme summaries are in all three languages; the full details are in English for now and admins can add translations per field.

Design: black and orange, kit stripes, safety tape for warnings, Oswald and Inter, 18px base text, print views.

## Where the content comes from

`src/data/programmes.json` and `src/data/site.json` were built from the two research databases dated 14 Nov 2026 ("Support for coal miners in Poland/Czechia: programme database"). Tags used by the wizard (worker groups, employers, regions, needs) and the short Czech and Polish summaries were added by hand. Map coordinates in `src/data/places.ts` are approximate and marked so.

Nothing here is legal or financial advice. Programme status, amounts and contacts must be re-checked before launch: the admin "Needs re-check" tab lists what to look at first.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Without any configuration the site runs in **demo mode**: everything works, and forum posts, sign-ups and accounts are saved only in your browser. The AI assistant falls back to a keyword search of the database when the server function is not available (as in `npm run dev`). Use `vercel dev` to run the assistant function locally.

## Share it on GitHub Pages (free, static)

The workflow `.github/workflows/pages.yml` builds the site and publishes it at `https://<user>.github.io/<repo>/` on every push to `main`.

1. On GitHub open **Settings → Pages** and set **Source** to **GitHub Actions** (once).
2. Push to `main`, or run the workflow by hand from the **Actions** tab.

GitHub Pages only serves files, so the site runs in demo mode there and the AI assistant uses its keyword-search fallback. To leave demo mode, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository variables (Settings → Secrets and variables → Actions → Variables). For the AI assistant, deploy to Vercel instead (below).

To try the Pages build locally:

```bash
export BASE_PATH=/life-after-coal/
npm run build && npx vite preview   # http://localhost:4173/life-after-coal/
```

## Deploy to Vercel (full version with the AI assistant)

1. **Supabase** (optional, for shared data and real accounts): create a project, open the SQL editor and run `supabase/migrations/0001_init.sql`. Then make yourself an admin:
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
2. **Vercel**: import the GitHub repo. Framework preset: Vite. Add environment variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (from Supabase, Project settings, API)
   - `ANTHROPIC_API_KEY` for the assistant, and optionally `ANTHROPIC_MODEL` (default `claude-haiku-5-5`)
3. Deploy. `vercel.json` sends every non-API path to the single-page app.

## Project structure

```
api/assistant.ts            Vercel function for the AI assistant
src/data/                   programmes, events, places, eligibility rules, types
src/i18n/                   cs, pl, en interface texts
src/lib/                    data layer (Supabase or browser storage), auth, content helpers, search
src/pages/                  one file per page
src/components/             layout and shared UI
supabase/migrations/        database schema and row-level security
```

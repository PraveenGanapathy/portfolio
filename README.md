# Praveen Ganapathy Ravi's Portfolio

Live at https://praveenganapathy.github.io/portfolio/

## Editing content

All content lives in `data.js`. The page is plain HTML generated from it, so after editing run:

```bash
node build.mjs
```

and commit `data.js` together with the regenerated `index.html`. No dependencies are needed (Node 18+).

| File | What it is |
| --- | --- |
| `data.js` | Content: jobs, projects, education, certifications, and the page copy under `page` |
| `build.mjs` | Writes `index.html` from `data.js` |
| `style.css` | All styles |
| `main.js` | Glass lens, project card deck, résumé-by-email form (EmailJS) |
| `tools/preview.mjs` | Local preview with live reload: `node tools/preview.mjs` |
| `liquid.js` | The animated azure liquid background (WebGL) |
| `backend.js` | Supabase client: logs a visit, approximate region, traffic source |
| `insights.js` | The "Who's visiting" stats and chart |
| `mileo.js` | Mileo the dog-bot: feed, cuddle, leave a note |
| `supabase/schema.sql` | Database tables, security rules and summary functions |
| `env-config.js` | EmailJS IDs, résumé link, and `MAINTENANCE_MODE` (see `MAINTENANCE.md`) |
| `images/projects/` | Screen recordings of each project (`.mp4`) with poster frames (`.jpg`) |
| `assets/` | Place photographs and their licences (`credits.json`) |

## Maintenance mode

GitHub → this repo → **Actions** → **Maintenance mode** → **Run workflow** → choose `on` or `off`.
It also works from the GitHub mobile app, or from a terminal: `gh workflow run maintenance.yml -f mode=on`.
The site switches about a minute later.

## Visitor stats and Mileo (Supabase)

1. Create a free project at https://supabase.com.
2. In the project: **SQL Editor** → New query → paste `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: copy the Project URL and the `anon` public key into `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` in `env-config.js`. The anon key is meant to be public: visitors can only add
   visits, feeds, cuddles and notes, and can only read totals.
4. Read notes in Supabase: **Table Editor → notes**.

To also get each note by email, create an EmailJS template that sends to you, using the variables
`{{message}}`, `{{reply_to}}` and `{{region}}`, and put its ID in `EMAILJS_NOTE_TEMPLATE_ID`.

Regions come from the visitor's browser time zone; no IP addresses are stored.

## Photo credits

- "World Bank building at Washington" by Shiny Things, CC BY 2.0, via Wikimedia Commons
- "Tidel Park Chennai" by Jbritto, CC BY 2.5, via Wikimedia Commons
- "UMass Dartmouth Campus Quad" by UMassD Marketing, CC0, via Wikimedia Commons

Credits are also shown on the page under each photograph.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Praveen Ganapathy Ravi. All rights reserved.

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
| `main.js` | Project preview, project filter, résumé-by-email form (EmailJS) |
| `env-config.js` | EmailJS IDs, résumé link, and `MAINTENANCE_MODE` (see `MAINTENANCE.md`) |
| `images/projects/` | Screen recordings of each project (`.mp4`) with poster frames (`.jpg`) |
| `assets/` | Place photographs and their licences (`credits.json`) |

## Photo credits

- "World Bank building at Washington" by Shiny Things, CC BY 2.0, via Wikimedia Commons
- "Tidel Park Chennai" by Jbritto, CC BY 2.5, via Wikimedia Commons
- "UMass Dartmouth Campus Quad" by UMassD Marketing, CC0, via Wikimedia Commons

Credits are also shown on the page under each photograph.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

Copyright © 2025 Praveen Ganapathy Ravi. All rights reserved.

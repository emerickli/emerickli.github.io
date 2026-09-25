# Kai Emerick Li

Static three-page portfolio. White page, Times, looks like a scanned report.

- `index.html` — home
- `projects.html` — project list (titles link through)
- `projects/01.html` … `06.html` — one report per project
- `contact.html` — contact details

No build step.

```bash
python3 serve.py
```

Open http://localhost:47291

Unknown paths (`/asdf`, `/not-a-page`) return `404.html` — the spinning
ouroboros. GitHub Pages does the same automatically from the `404.html`
file at the repo root.

Intended for `emerickli.github.io` (GitHub Pages, `main` branch root).
Anything in `[ brackets ]` is a placeholder.

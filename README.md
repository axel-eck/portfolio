# Axel Eckenberg Portfolio

Personal portfolio built with Nuxt 4, Vue 3, Tailwind CSS v4, `@nuxtjs/i18n`, Nuxt Icon, Nuxt Fonts and `motion-v`.

The site is a bilingual single-page portfolio with localized content, markdown-backed writing entries, a custom cursor, magnetic cursor targets, and downloadable CV links.

## Requirements

- Bun
- Node-compatible runtime for Nuxt tooling

Install dependencies:

```bash
bun install
```

## Development

Start the dev server:

```bash
bun run dev
```

Production build:

```bash
bun run build
```

Preview a production build:

```bash
bun run preview
```

## Project Structure

- `app/pages/index.vue`: main portfolio page
- `app/components`: navigation, footer, cursor, hero production card and shared UI
- `app/assets/css/main.css`: Tailwind theme, base styles and writing prose styles
- `i18n/locales/fr.json`: French copy
- `i18n/locales/en.json`: English copy
- `content/writings/fr`: French markdown notes
- `content/writings/en`: English markdown notes
- `content/quotes/fr`: French testimonial markdown files
- `content/quotes/en`: English testimonial markdown files
- `public/fr/cv.pdf`: French CV
- `public/en/cv.pdf`: English CV
- `public/og.svg`: social preview image

## Localized Writings

Markdown notes are locale-specific. Add files to:

```text
content/writings/fr/my-note.md
content/writings/en/my-note.md
```

Each file can start with a simple metadata header:

```markdown
title: My note title
date: 2026-05-12
tags: nuxt, infra
---

Markdown body goes here.
```

Markdown is imported at build time, so the writing system works on static hosting such as GitHub Pages.

## Quotes

Testimonial-style notes from past collaborators. Locale-specific, mirrors the writings layout:

```text
content/quotes/fr/jane-doe.md
content/quotes/en/jane-doe.md
```

The section auto-hides when no markdown file exists for the active locale.

Each file starts with a metadata header. All fields are optional except `Person_Name`; the card adapts when one is missing.

```markdown
Entreprise: Acme
Entreprise_Logo_Link: https://acme.example/logo.svg
Entreprise_Link: https://acme.example
Person_Name: Jane Doe
Person_Role: VP Engineering
Person_Link: https://www.linkedin.com/in/jane-doe/
Person_Avatar_Link: https://media.licdn.com/.../jane.jpg
Period: 2024 Q1 — Q3
Date: 2024-10-12
---

Markdown body holds the quote itself. Inline _emphasis_ and **bold** are supported.
```

Field roles:

- `Person_Name` — required, displayed first
- `Person_Role` — anchors authority (e.g. "CTO", "Engineering Manager")
- `Person_Link` — external profile, makes the quote verifiable
- `Person_Avatar_Link` — round avatar to the left of the name
- `Entreprise`, `Entreprise_Logo_Link`, `Entreprise_Link` — company context, optional logo chip
- `Period` — when the collaboration happened
- `Date` — when the quote was written; used for sorting (newest first)

## CV Files

CV buttons are shown only when the corresponding public PDF exists:

```text
public/fr/cv.pdf
public/en/cv.pdf
```

The browser checks the localized PDF with a static `HEAD` request before rendering the download link. This keeps the buttons from pointing to missing files while still working on GitHub Pages.

## GitHub Pages

The repository deploys through `.github/workflows/pages.yml`.

The workflow runs:

```bash
bun install --frozen-lockfile
bun run generate
```

For the custom domain, it sets:

```text
NUXT_APP_BASE_URL=/
NUXT_PUBLIC_SITE_URL=https://axel-eck.fr
```

The `public/CNAME` file keeps GitHub Pages attached to `axel-eck.fr`
when the static artifact is deployed.

## SEO

SEO copy lives in the locale files under `seo`. The social preview image is `public/og.svg`.

The page sets localized title, description, Open Graph and Twitter metadata at runtime.

## Verification

Run targeted lint with Bun:

```bash
bun ./node_modules/.bin/eslint app server
```

The markdown renderer intentionally uses `v-html` for trusted local content, so `vue/no-v-html` may warn on `app/pages/index.vue`.

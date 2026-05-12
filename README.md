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
- `server/api/writings.get.ts`: localized writings API
- `server/api/cv.get.ts`: localized CV availability API
- `server/utils/writings.ts`: markdown loading and parsing
- `content/writings/fr`: French markdown notes
- `content/writings/en`: English markdown notes
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

The page requests `/api/writings?locale=fr` or `/api/writings?locale=en` based on the active language.

## CV Files

CV buttons are shown only when the corresponding public PDF exists:

```text
public/fr/cv.pdf
public/en/cv.pdf
```

The page checks `/api/cv?locale=fr` or `/api/cv?locale=en` before rendering the download link.

## SEO

SEO copy lives in the locale files under `seo`. The social preview image is `public/og.svg`.

The page sets localized title, description, Open Graph and Twitter metadata at runtime.

## Verification

Run targeted lint with Bun:

```bash
bun ./node_modules/.bin/eslint app server
```

The markdown renderer intentionally uses `v-html` for trusted local content, so `vue/no-v-html` may warn on `app/pages/index.vue`.

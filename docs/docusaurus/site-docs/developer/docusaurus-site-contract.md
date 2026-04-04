# Docs and API workflow

This repository keeps the documentation site split into two source areas:

- `docs/rules/**` for hand-written rule and preset docs
- `docs/docusaurus/**` for the Docusaurus site shell, homepage, developer docs, and TypeDoc config

## Layout

### Rule docs

The rule-doc plugin mounts `docs/rules/**` at:

- `/docs/rules/overview`
- `/docs/rules/getting-started`
- `/docs/rules/presets/*`
- `/docs/rules/activate`

These pages are hand-authored so they can stay focused on real usage, CLI output behavior, and preset guidance.

### Developer docs

The primary Docusaurus docs plugin serves `docs/docusaurus/site-docs/**` at `/docs/*`.

This section is used for:

- maintainer workflow notes
- release process documentation
- docs generation notes
- generated API pages under `/docs/developer/api`

## TypeDoc generation

TypeDoc is configured from `docs/docusaurus/typedoc.config.json` and writes markdown into:

`docs/docusaurus/site-docs/developer/api`

The current API generation targets:

- `src/index.ts`
- `src/types.ts`
- `src/rules/progress.ts`

Generate the API pages with:

```bash
npm run docs:api
```

## Common commands

From the repository root:

```bash
npm run docs:install
npm run docs:typecheck
npm run docs:api
npm run docs:build
npm run docs:start
```

## Editing guidance

- Edit the hand-written docs in `docs/rules/**` and `docs/docusaurus/site-docs/**`.
- Do not hand-edit generated API markdown under `site-docs/developer/api`; regenerate it from source instead.
- Keep navigation labels aligned with the real public surface of the plugin: one rule, three presets, and the TypeScript API.

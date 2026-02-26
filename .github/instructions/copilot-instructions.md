---
name: "Copilot-Instructions-ESLint-Plugin"
description: "Instructions for the expert TypeScript AST and ESLint Plugin architect."
applyTo: "**"
---

# Project Guidelines

## Build and Test

- Install dependencies: `npm install` (or `npm ci` in CI).
- Main validation command: `npm run check`.
    - Runs: `lint`, `typecheck`, `test`, `format:check`.
- Release readiness: `npm run release:verify` (runs `check` + `publint`).
- Build output: `npm run build` emits `dist/**` from `src/**`.

## Architecture

- This is an ESLint plugin package (`eslint-plugin-file-progress-2`) written in TypeScript.
- Core entrypoint: `src/index.ts`.
    - Exports plugin metadata, configs (`recommended`, `recommended-ci`), and rule registration.
- Core rule: `src/rules/progress.ts`.
    - Handles spinner/progress output and settings normalization.
- Public typings: `src/types.ts`.
- Tests: `test/progress.test.ts` (Node test runner via `tsx`).

## Conventions

- Use ESM imports/exports and NodeNext-compatible TypeScript.
- Keep TypeScript strictness high (see `tsconfig.json` and `tsconfig.build.json`).
- Rule id is `file-progress/activate`.
- Flat config is the standard (`eslint.config.js`), not legacy `.eslintrc`.
- Use `prettier` and existing npm scripts instead of ad-hoc formatting commands.

## Project-Specific Pitfalls

- ESLint config dogfoods the local plugin from `./dist/index.js`.
    - `prelint` runs `build` first, so use `npm run lint`/`npm run check` instead of calling `eslint` directly in a clean repo.
- Package publishing includes only `dist/**` (`package.json` `files` field).
    - Do not manually edit `dist`; always regenerate with `npm run build`.
- For release PRs/publishes, include a valid `.changeset/*.md` entry.
- Keep cross-platform behavior in mind (Windows vs Linux paths), especially in path-handling tests/utilities.

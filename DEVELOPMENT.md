# Development Guide

This document is for contributors and maintainers.

## Local Setup

```bash
npm install
```

## Common Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format
npm run check
npm run publint
npm run release:verify
```

## Project Notes

- Source is authored in TypeScript under `src/**`.
- Build output is emitted to `dist/**`.
- ESLint config dogfoods the built local plugin from `dist`.

## Versioning and Releases (Changesets)

This repository uses Changesets for versioning and npm publishing.

### 1) Add a changeset

For any user-facing change, add a changeset file:

```bash
npm run changeset
```

### 2) Commit and push

Commit code + changeset and push your branch.

### 3) Release workflow behavior

On `master`, the Release workflow (`changesets/action`) will:

- open/update a version PR when pending changesets exist
- publish to npm after the version PR is merged

### Useful changeset commands

```bash
npm run changeset:status
npm run changeset:version
```

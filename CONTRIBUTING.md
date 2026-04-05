# Contributing to eslint-plugin-file-progress-2

Thanks for your interest in contributing.

This repository contains an ESLint plugin that adds file-by-file progress output
for CLI lint runs, plus a Docusaurus + TypeDoc docs site for the package.

## Prerequisites

- Node.js `>=22.0.0`
- npm `>=11`
- Git

## Local setup

1. Fork and clone the repository.
2. Install dependencies from the repository root:

   ```bash
   npm ci --force
   ```

3. Run the main quality gate:

   ```bash
   npm run check
   ```

## Recommended development workflow

1. Create a branch from `master`.
2. Make focused changes.
3. Add or update tests in `test/` when behavior changes.
4. Update docs when public behavior changes:
   - root docs such as `README.md` and `DEVELOPMENT.md`
   - rule docs under `docs/rules/`
   - site docs under `docs/docusaurus/site-docs/`
5. Run the relevant validation commands before opening a pull request.

## Validation commands

Use these commands locally before opening a pull request:

- `npm run check`
- `npm run docs:check`
- `npm run release:check`
- `npm run test:coverage`

Focused checks are also available:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run lint:md`
- `npm run lint:styles`
- `npm run format:check`

## Logging and diagnostics policy

This plugin intentionally produces terminal output as part of its feature set.
That means progress and summary output in `src/rules/progress.ts` is legitimate
product behavior, not incidental debug logging.

Please follow these rules when changing runtime output:

- Keep user-facing progress output intentional, minimal, and documented.
- Do not add stray debug-only `console.*` statements in source files.
- Prefer test assertions over ad hoc logging in `test/**`.
- CLI/build scripts under `scripts/**` may use `console.log`/`console.warn` when
  they are part of normal command output.

## Project layout

```text
.
├── src/                  # Plugin source and exported configs
├── test/                 # Node test runner suites
├── docs/                 # Rule docs and Docusaurus site app
├── scripts/              # Build and release helper scripts
├── .github/              # Workflows, issue templates, and automation config
└── package.json          # Scripts, dependencies, and metadata
```

## Docs and release notes

If you change package behavior, keep the public docs aligned:

- `README.md` for installation and quick-start usage
- `docs/rules/*.md` for rule/preset details
- `docs/docusaurus/site-docs/**` for site content

Manual releases are handled by `.github/workflows/release.yml`. Before triggering
that workflow, run:

```bash
npm run release:check
```

## Commit guidance

Gitmoji + bracketed conventional type commits are recommended because release
notes and changelog tooling are commit-message aware.

Format:

- `<gitmoji> [type](scope?): subject`

Examples:

- `✨ [feat](docs): add developer workflow page`
- `🐛 [fix](progress): avoid duplicate success summary`
- `📝 [docs]: clarify recommended-ci behavior`

## Pull request expectations

- Keep pull requests scoped and reviewable.
- Include tests for behavior changes.
- Keep docs in sync with implementation changes.
- Avoid unrelated lockfile or formatting churn.

## Security

Do not open public issues for potential vulnerabilities.
Use the process described in [SECURITY.md](./SECURITY.md).

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](./LICENSE).

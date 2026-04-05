# eslint-plugin-file-progress-2

[![npm license.](https://flat.badgen.net/npm/license/eslint-plugin-file-progress-2?color=purple)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/eslint-plugin-file-progress-2?color=pink)](https://www.npmjs.com/package/eslint-plugin-file-progress-2) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-file-progress-2?color=cyan)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-file-progress-2?color=yellow)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-file-progress-2?color=green)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-file-progress-2?color=red)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/issues) [![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/eslint-plugin-file-progress-2?color=blue)](https://codecov.io/gh/Nick2bad4u/eslint-plugin-file-progress-2)

> ESLint plugin that improves CLI progress output without changing lint semantics.

> Fork note: Originally created by [@sibiraj-s](https://github.com/sibiraj-s) in [`eslint-plugin-file-progress`](https://github.com/sibiraj-s/eslint-plugin-file-progress). Huge thanks for the original plugin.

## Demo

- Who likes a silent console ¯\\_(ツ)_/¯

<div align="center">
  <img src="https://raw.githubusercontent.com/Nick2bad4u/eslint-plugin-file-progress-2/refs/heads/master/assets/progress-2.gif" alt="Progress Demo" width="100%">
  <img src="https://raw.githubusercontent.com/Nick2bad4u/eslint-plugin-file-progress-2/refs/heads/master/assets/summary-msg.png" alt="Detailed summary demo" width="100%">
</div>

## Installation

```bash
npm install --save-dev eslint-plugin-file-progress-2
```

## Quick start

Use the default preset when you want full per-file progress during local CLI runs:

```ts
// eslint.config.mjs
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## Configure a rule directly

Modern ESLint usage should configure progress behavior as rule options:

```ts
// eslint.config.mjs
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/activate": [
        "warn",
        {
          outputStream: "stderr",
          throttleMs: 100,
          ttyOnly: true,
        },
      ],
    },
  },
];
```

Useful options include:

- `ttyOnly`: show progress only on interactive terminals
- `throttleMs`: reduce repaint churn on large runs
- `minFilesBeforeShow`: skip progress output until ESLint has seen the configured number of files
- `showSummaryWhenHidden`: keep the final summary even when live output is hidden
- `pathFormat`: choose between `"relative"` and `"basename"`
- `outputStream`: send progress to `stdout` or `stderr`

## Presets

The plugin now ships with these Flat Config-ready presets:

- `recommended`: full per-file progress using default options
- `recommended-ci`: hides progress when `CI === "true"`
- `recommended-detailed`: enables the detailed completion summary
- `recommended-compact`: enables the compact live mode
- `recommended-summary-only`: prints only the final summary
- `recommended-tty`: enables `ttyOnly: true`
- `recommended-ci-detailed`: hides live output in CI but still prints the detailed summary there

Use any preset exactly the same way:

```ts
// eslint.config.mjs
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-compact"]];
```

## Deprecated configuration fallback

`settings.progress` still works as a backwards-compatible fallback, but it is now deprecated.

Prefer this:

```ts
rules: {
  "file-progress/activate": ["warn", { pathFormat: "basename" }],
}
```

Instead of this:

```ts
settings: {
  progress: {
    hideDirectoryNames: true,
  },
}
```

If both are present, rule options win.

## Rules

<!-- begin generated rules table -->
Generated from the plugin rule metadata and preset registry.

| Rule | Description | Included in presets |
| --- | --- | --- |
| [`file-progress/activate`](./docs/rules/activate.md) | Display live per-file lint progress in CLI output. | [`recommended`](./docs/rules/presets/recommended.md), [`recommended-ci`](./docs/rules/presets/recommended-ci.md), [`recommended-detailed`](./docs/rules/presets/recommended-detailed.md), [`recommended-tty`](./docs/rules/presets/recommended-tty.md), [`recommended-ci-detailed`](./docs/rules/presets/recommended-ci-detailed.md) |
| [`file-progress/compact`](./docs/rules/compact.md) | Display compact lint progress in CLI output without showing file names. | [`recommended-compact`](./docs/rules/presets/recommended-compact.md) |
| [`file-progress/summary-only`](./docs/rules/summary-only.md) | Display only the final lint completion summary in CLI output. | [`recommended-summary-only`](./docs/rules/presets/recommended-summary-only.md) |
<!-- end generated rules table -->

## CLI-only usage

If you do not want editor integrations to see these runtime rules, keep the plugin out of your shared config and enable it only from the CLI:

```bash
npx eslint . --plugin file-progress --rule 'file-progress/activate: warn'
```

Or expose that through a package script:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:progress": "eslint . --plugin file-progress --rule \"file-progress/activate: warn\""
  }
}
```

## Contributing

- Contributor and release documentation is available in [DEVELOPMENT.md](./DEVELOPMENT.md).
- The Docusaurus/TypeDoc site source lives under [`docs/docusaurus`](./docs/docusaurus).
- Rule docs live under [`docs/rules`](./docs/rules).

# Getting Started

Install the plugin:

```bash
npm install --save-dev eslint-plugin-file-progress-2
```

## Quick start with Flat Config

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## Configure a rule directly

```ts
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

For a full option-by-option reference, default values, and deprecated fallback
notes, read [`activate`](./activate.md).

## Preset choices

- [🟡 `recommended`](./presets/recommended.md): full per-file progress
- [🟠 `recommended-ci`](./presets/recommended-ci.md): hides progress when `CI === "true"`
- [🔵 `recommended-detailed`](./presets/recommended-detailed.md): enables the detailed summary
- [🟣 `recommended-compact`](./presets/recommended-compact.md): uses the compact live mode
- [⚪ `recommended-summary-only`](./presets/recommended-summary-only.md): prints only the final summary
- [🟢 `recommended-tty`](./presets/recommended-tty.md): enables `ttyOnly: true`
- [🟤 `recommended-ci-detailed`](./presets/recommended-ci-detailed.md): keeps CI output quiet but still prints the detailed summary there

## Rule choices

If you are not using one of the built-in presets, choose the rule that matches the output mode you want:

- [`file-progress/activate`](./activate.md): full per-file progress updates
- [`file-progress/compact`](./compact.md): generic live progress without file names
- [`file-progress/summary-only`](./summary-only.md): final summary only

## Deprecated settings fallback

`settings.progress` still works, but it is deprecated.

Prefer rule options whenever you change runtime behavior, especially for:

- `ttyOnly`
- `throttleMs`
- `minFilesBeforeShow`
- `showSummaryWhenHidden`
- `pathFormat`
- `outputStream`

## CLI-only usage

If you do not want editor integrations to see these runtime rules, keep the plugin out of your shared config and enable it only from the CLI:

```bash
npx eslint . --plugin file-progress --rule 'file-progress/activate: warn'
```

## Next step

Read the [preset guide](./presets/index.md) or jump to [activate](./activate.md).

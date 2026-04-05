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

## Preset choices

- `recommended`: full per-file progress
- `recommended-ci`: hides progress when `CI === "true"`
- `recommended-detailed`: enables the detailed summary
- `recommended-compact`: uses the compact live mode
- `recommended-summary-only`: prints only the final summary
- `recommended-tty`: enables `ttyOnly: true`
- `recommended-ci-detailed`: keeps CI output quiet but still prints the detailed summary there

## Rule choices

If you are not using one of the built-in presets, choose the rule that matches the output mode you want:

- `file-progress/activate`: full per-file progress updates
- `file-progress/compact`: generic live progress without file names
- `file-progress/summary-only`: final summary only

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

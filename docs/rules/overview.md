# Overview

`eslint-plugin-file-progress-2` is intentionally narrow.

It does not lint code semantics. It only changes how ESLint reports progress in CLI-oriented workflows.

## What the plugin includes

- three public rules:
  - `file-progress/activate`
  - `file-progress/compact`
  - `file-progress/summary-only`
- seven presets:
  - `recommended`
  - `recommended-ci`
  - `recommended-detailed`
  - `recommended-compact`
  - `recommended-summary-only`
  - `recommended-tty`
  - `recommended-ci-detailed`

## Primary configuration model

The primary API is now rule options:

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

The older `settings.progress` shape still works as a fallback, but it is deprecated.

## Mode selection

- Use `file-progress/activate` when you want full per-file progress.
- Use `file-progress/compact` when you want a live spinner without file-path churn.
- Use `file-progress/summary-only` when you only want the final completion summary.

## Notable options

- `ttyOnly`: suppress output when the selected stream is not interactive.
- `throttleMs`: limit how frequently the file-progress line repaints.
- `minFilesBeforeShow`: avoid showing progress for short runs.
- `showSummaryWhenHidden`: keep the final summary even when live output is hidden.
- `pathFormat`: choose between relative paths and basenames.
- `outputStream`: send progress to `stdout` or `stderr`.

## What this plugin is not trying to do

- It does **not** report lint problems by itself.
- It does **not** change rule severity or lint semantics.
- It is **not** a formatter, JSON reporter, or percentage tracker.

## Next step

Continue with [Getting Started](./getting-started.md) to pick a preset or configure a rule directly.

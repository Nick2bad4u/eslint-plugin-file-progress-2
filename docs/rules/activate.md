# activate

Display live per-file lint progress in CLI output.

## Targeted pattern scope

This rule is for CLI-oriented ESLint runs where visible progress matters.

It enables the plugin's full live mode, including spinner updates and per-file path repainting.

## What this rule reports

This rule does not report source-code violations.

Enabling it changes ESLint's terminal output behavior for the current run.

## Why this rule exists

Long ESLint runs can feel silent and untrustworthy when the terminal shows no activity while ESLint is still working.

This rule exists to make those runs easier to monitor without changing lint semantics.

## ❌ Incorrect

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      // No live progress will be shown.
      "file-progress/activate": "off",
    },
  },
];
```

## ✅ Correct

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

## Behavior and migration notes

This rule accepts the following option object:

```ts
interface ProgressRuleOptions {
  detailedSuccess?: boolean;
  failureMark?: string;
  fileNameOnNewLine?: boolean;
  hide?: boolean;
  hideFileName?: boolean;
  hidePrefix?: boolean;
  minFilesBeforeShow?: number;
  outputStream?: "stderr" | "stdout";
  pathFormat?: "relative" | "basename";
  prefixMark?: string;
  showSummaryWhenHidden?: boolean;
  spinnerStyle?: "arc" | "bounce" | "clock" | "dots" | "line";
  successMark?: string;
  successMessage?: string;
  throttleMs?: number;
  ttyOnly?: boolean;
}
```

Default values:

```ts
{
  detailedSuccess: false,
  failureMark: "✖",
  fileNameOnNewLine: false,
  hide: false,
  hideFileName: false,
  hidePrefix: false,
  minFilesBeforeShow: 0,
  outputStream: "stderr",
  pathFormat: "relative",
  prefixMark: "•",
  showSummaryWhenHidden: false,
  spinnerStyle: "dots",
  successMark: "✔",
  successMessage: "Lint complete.",
  throttleMs: 0,
  ttyOnly: false,
}
```

Important behavior details:

- `ttyOnly` suppresses output when the selected stream is not interactive.
- `throttleMs` limits how often file-path updates repaint.
- `minFilesBeforeShow` delays progress output until ESLint has seen the configured number of files.
- `showSummaryWhenHidden` still prints the final summary when live output is hidden.
- `pathFormat: "basename"` replaces the older `hideDirectoryNames` style.
- `settings.progress` is still read as a deprecated fallback, but rule options win when both are present.

## Additional examples

### ✅ Correct — basename-only paths

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
          pathFormat: "basename",
        },
      ],
    },
  },
];
```

### ✅ Correct — keep the final summary when live output is hidden

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
          hide: true,
          showSummaryWhenHidden: true,
        },
      ],
    },
  },
];
```

## ESLint flat config example

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
          detailedSuccess: true,
          outputStream: "stderr",
          throttleMs: 100,
          ttyOnly: true,
        },
      ],
    },
  },
];
```

## When not to use it

Do not use this rule if:

- you want the quietest possible output mode
- a single final summary line is enough for the workflow
- editor integrations share the same config and should never show live progress

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package.

> **Rule catalog ID:** R001

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [compact](./compact.md)
- [summary-only](./summary-only.md)
- [Preset reference](./presets/index.md)

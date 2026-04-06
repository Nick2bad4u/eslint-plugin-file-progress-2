# compact

Display live lint progress in the CLI without printing per-file names.

## Targeted pattern scope

This rule targets the same CLI progress workflow as [`activate`](./activate.md), but it uses a lower-noise live mode.

It keeps the spinner and final summary while suppressing per-file path repainting.

## What this rule reports

This rule does not report source-code violations.

Enabling it changes CLI output behavior for the current run.

## Why this rule exists

Per-file updates are sometimes more noise than signal.

This rule exists for workflows that still want visible activity but do not need to see the current path.

## ❌ Incorrect

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      // This still repaints the current file path.
      "file-progress/activate": "warn",
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
      "file-progress/compact": [
        "warn",
        {
          minFilesBeforeShow: 5,
          ttyOnly: true,
        },
      ],
    },
  },
];
```

## Behavior and migration notes

This rule accepts the same option object as [`activate`](./activate.md).

Mode-specific notes:

- `compact` always hides file names during live output.
- `pathFormat` has no visible effect while live output is active, because there is no path to format.
- `showSummaryWhenHidden` still matters when `hide`, `ttyOnly`, or `minFilesBeforeShow` suppress the live indicator.
- `settings.progress` is still read as a deprecated fallback, but rule options win when both are present.

## Additional examples

### ✅ Correct — send compact progress to stdout

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/compact": [
        "warn",
        {
          outputStream: "stdout",
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
      "file-progress/compact": [
        "warn",
        {
          spinnerStyle: "arc",
          ttyOnly: true,
        },
      ],
    },
  },
];
```

## When not to use it

Do not use this rule if:

- you need to see the current file path during long runs
- you want no live output at all

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package.

> **Rule catalog ID:** R002

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [activate](./activate.md)
- [summary-only](./summary-only.md)
- [Preset reference](./presets/index.md)

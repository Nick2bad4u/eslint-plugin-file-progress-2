# summary-only

Display only the final lint completion summary in the CLI.

## Targeted pattern scope

This rule targets CLI workflows where live progress should stay silent and only the final completion signal should be printed.

## What this rule reports

This rule does not report source-code violations.

Enabling it changes CLI output behavior for the current run.

## Why this rule exists

Some workflows want deterministic output during the run but still want a clear completion line at the end.

This rule exists for that summary-first mode.

## ❌ Incorrect

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      // This still emits live progress updates.
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
      "file-progress/summary-only": [
        "warn",
        {
          detailedSuccess: true,
          outputStream: "stderr",
        },
      ],
    },
  },
];
```

## Behavior and migration notes

This rule accepts the same option object as [`activate`](./activate.md).

Mode-specific notes:

- `summary-only` never shows live progress.
- `detailedSuccess` is especially useful here because the summary line is the entire user experience.
- `minFilesBeforeShow` and `ttyOnly` can still suppress the summary unless `showSummaryWhenHidden` is enabled.
- `settings.progress` is still read as a deprecated fallback, but rule options win when both are present.

## Additional examples

### ✅ Correct — keep the summary even when the rule would otherwise hide output

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/summary-only": [
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
      "file-progress/summary-only": [
        "warn",
        {
          detailedSuccess: true,
          hidePrefix: true,
        },
      ],
    },
  },
];
```

## When not to use it

Do not use this rule if:

- you want visible proof that ESLint is still moving through files
- the current file path is useful operational feedback

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package.

> **Rule catalog ID:** R003

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [activate](./activate.md)
- [compact](./compact.md)
- [Preset reference](./presets/index.md)

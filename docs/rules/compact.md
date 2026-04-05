# compact

Display live lint progress in the CLI without printing per-file names.

## Targeted pattern scope

This rule targets the same CLI progress workflow as `activate`, but it uses a lower-noise live output mode.

It keeps these behaviors:

- a live spinner or progress indicator while ESLint runs
- a final completion summary at process exit

It intentionally avoids one behavior:

- printing the current file path during the run

## What this rule reports

This rule does not report source-code violations.

Enabling it turns on compact live progress for the current ESLint run.

## Why this rule exists

Per-file updates are useful, but they are not always the best output mode.

- Narrow terminals can become harder to read when paths constantly repaint.
- Captured logs may benefit from a stable “still running” signal.
- Some teams want visible activity without file-by-file churn.

This rule exists as a built-in ergonomic mode for that quieter style.

## ❌ Incorrect

```ts
// eslint.config.ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      // This prints every file path while linting.
      "file-progress/activate": "warn",
    },
  },
];
```

## ✅ Correct

```ts
// eslint.config.ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      // This keeps progress visible without file-name churn.
      "file-progress/compact": "warn",
    },
  },
];
```

## Behavior and migration notes

- This rule is effectively a packaged version of the main progress rule with file names suppressed.
- It is a better fit than `activate` when file-level detail is unnecessary.
- It is still noisier than `summary-only`, because it still shows a live indicator.
- Do not combine it with `activate` or `summary-only` in the same config.

## Additional examples

### ❌ Incorrect — compact mode when file-level progress is required

```ts
// eslint.config.ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/compact": "warn",
    },
  },
];
```

### ✅ Correct — use activate when file-level visibility matters

```ts
// eslint.config.ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/activate": "warn",
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
      "file-progress/compact": "warn",
    },
  },
];
```

## When not to use it

Do not use this rule if:

- you explicitly want to see the current file path during long runs
- you want no live updates at all

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package and provides a quieter live-progress mode for CLI linting.

> **Rule catalog ID:** R002

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [activate](./activate.md)
- [summary-only](./summary-only.md)

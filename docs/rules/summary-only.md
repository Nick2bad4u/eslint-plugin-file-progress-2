# summary-only

Display only the final lint completion summary in the CLI.

## Targeted pattern scope

This rule targets CLI lint workflows where the desired plugin output is limited to the end-of-run summary.

It keeps one behavior:

- printing the final success or failure summary when ESLint exits

It intentionally suppresses one behavior:

- live spinner or per-file progress updates while the run is in progress

## What this rule reports

This rule does not report source-code violations.

Enabling it turns on summary-only output for the current ESLint run.

## Why this rule exists

Some workflows want the plugin’s completion summary, but not any live terminal updates.

- CI logs can be easier to scan when only the completion summary is printed.
- Some local scripts prefer deterministic output over ongoing animation.
- Summary-only mode preserves the completion signal without repainting the terminal during the run.

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
      // This still emits live progress updates.
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
      // This prints only the final completion output.
      "file-progress/summary-only": "warn",
    },
  },
];
```

## Behavior and migration notes

- This rule suppresses live spinner updates entirely.
- It is the quietest built-in output mode provided by the plugin.
- If you still want a visible “working” signal while ESLint runs, use `compact` instead.
- Do not combine it with `activate` or `compact`; choose one output mode.

## Additional examples

### ❌ Incorrect — summary-only when visible live activity is required

```ts
// eslint.config.ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/summary-only": "warn",
    },
  },
];
```

### ✅ Correct — compact mode when you still want live feedback

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

## ESLint flat config example

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  {
    plugins: {
      "file-progress": progress,
    },
    rules: {
      "file-progress/summary-only": "warn",
    },
  },
];
```

## When not to use it

Do not use this rule if:

- you want a visible signal that linting is still progressing
- the current file path is important feedback for the workflow

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package and provides a final-summary-only mode for CLI linting.

> **Rule catalog ID:** R003

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [activate](./activate.md)
- [compact](./compact.md)

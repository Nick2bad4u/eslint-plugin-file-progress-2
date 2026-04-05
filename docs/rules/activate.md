# activate

Display live per-file lint progress in CLI output.

## Targeted pattern scope

This rule is intended for ESLint CLI runs where developers want visible, ongoing progress while files are being linted.

It activates three runtime behaviors:

- start a spinner when linting begins
- update the current file path as the run progresses
- print a final success or failure summary when ESLint exits

## What this rule reports

This rule does not report source-code violations.

Instead, enabling it turns on the plugin's full live progress mode for the current ESLint run.

## Why this rule exists

Long ESLint runs can feel silent and uncertain.

- Developers may assume the run is stalled when nothing is printed for a while.
- Seeing the current file path makes long runs easier to trust.
- A final completion line provides a clearer end state than a raw process exit.

This rule exists to improve CLI feedback without changing lint semantics.

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
      // No progress output will be shown during the run.
      "file-progress/activate": "off",
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
      // Show per-file progress while ESLint is running.
      "file-progress/activate": "warn",
    },
  },
];
```

## Behavior and migration notes

- This rule reads behavior controls from `settings.progress`.
- Use `hideFileName`, `hidePrefix`, `hideDirectoryNames`, and `detailedSuccess` when you want to refine the output style.
- If you want a quieter live mode, use `compact`.
- If you want only the final completion summary, use `summary-only`.
- Do not enable multiple `file-progress/*` runtime rules at the same time; choose one output mode per config.

## Additional examples

### ❌ Incorrect — full per-file output when lower-noise progress is preferred

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

### ✅ Correct — use compact mode when file names are unnecessary

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
      "file-progress/activate": "warn",
    },
    settings: {
      progress: {
        detailedSuccess: true,
        fileNameOnNewLine: true,
        spinnerStyle: "dots",
      },
    },
  },
];
```

## When not to use it

Do not use this rule if:

- your workflow should stay silent until the run ends
- editor integrations reuse the same config and you do not want live progress there
- a generic progress indicator is sufficient and file-path updates are unnecessary

## Package documentation

This rule is part of the `eslint-plugin-file-progress-2` package and is intended for CLI-first lint workflows.

> **Rule catalog ID:** R001

## Further reading

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [Preset Reference](./presets/index.md)
- [compact](./compact.md)
- [summary-only](./summary-only.md)

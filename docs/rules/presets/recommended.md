# `recommended`

Use this preset when you want standard progress output during local ESLint CLI runs.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## What it enables

- registers the `file-progress` plugin
- enables `file-progress/activate` at `warn`
- keeps all advanced settings at their defaults

This is the best starting point for most local development environments.

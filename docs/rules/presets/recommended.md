# recommended

Use this preset when you want standard per-file progress during local ESLint CLI runs.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## What it enables

- registers the `file-progress` plugin
- enables `file-progress/activate` at `warn`
- leaves all rule options at their defaults

This is the best starting point for most local terminal workflows.

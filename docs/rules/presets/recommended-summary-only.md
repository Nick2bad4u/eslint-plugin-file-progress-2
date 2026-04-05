# recommended-summary-only

Use this preset when you only want the final summary line and no live updates while ESLint is running.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-summary-only"]];
```

## What it changes

- registers the `file-progress` plugin
- enables `file-progress/summary-only` at `warn`

Choose this preset when deterministic output matters more than live feedback.

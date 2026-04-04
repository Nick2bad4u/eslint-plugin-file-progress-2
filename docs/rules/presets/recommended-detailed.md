# `recommended-detailed`

Use this preset when you want the final success summary to include extra run details by default.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-detailed"]];
```

## What it changes

It enables the same rule as `recommended`, but also sets:

```ts
settings: {
  progress: {
    detailedSuccess: true,
  },
}
```

This is useful when you want the completion message to include:

- elapsed time
- number of files linted
- throughput
- exit code
- problems summary

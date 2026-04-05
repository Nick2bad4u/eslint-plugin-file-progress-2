# recommended-detailed

Use this preset when you want the final success summary to include duration, file count, throughput, exit code, and problem status by default.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-detailed"]];
```

## What it changes

It enables `file-progress/activate` with:

```ts
{
  detailedSuccess: true,
}
```

Use this preset when you want a richer completion summary but still want normal per-file live progress.

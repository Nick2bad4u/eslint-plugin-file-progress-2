# recommended-ci-detailed

Use this preset when CI should suppress live output but still print a detailed final summary.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci-detailed"]];
```

## What it changes

It enables `file-progress/activate` with CI-aware options equivalent to:

```ts
{
  detailedSuccess: true,
  hide: process.env.CI === "true",
  showSummaryWhenHidden: process.env.CI === "true",
}
```

That means:

- local runs behave like `recommended-detailed`
- CI runs suppress live output but still emit the detailed summary

This is the best preset when CI logs should stay stable without losing end-of-run context.

# recommended-ci-detailed

Use this preset when CI should suppress live output but still print a detailed final summary.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci-detailed"]];
```

## Demo

[![Demo of the recommended-ci-detailed preset showing a quiet CI run with a final detailed summary.](../../docusaurus/static/demos/presets/recommended-ci-detailed.gif)](../../docusaurus/static/demos/presets/recommended-ci-detailed.gif)

Notice that CI-style live output stays hidden, but the final summary still appears with aligned detailed metrics.

This demo captures a CI-like run. Live output stays hidden, but the final detailed summary is still emitted.

[Recorded with VHS](https://github.com/charmbracelet/vhs#readme)

[Download the recorded cast](../../docusaurus/static/demos/presets/casts/recommended-ci-detailed.cast)

## What it changes

It enables [`file-progress/activate`](../../rules/activate.md) with CI-aware options equivalent to:

```ts
{
  detailedSuccess: true,
  hide: process.env.CI === "true",
  showSummaryWhenHidden: process.env.CI === "true",
}
```

That means:

- local runs behave like [`recommended-detailed`](./recommended-detailed.md) with live progress and a detailed summary
- CI runs suppress live output but still emit the detailed summary

This is the best preset when CI logs should stay stable without losing end-of-run context.

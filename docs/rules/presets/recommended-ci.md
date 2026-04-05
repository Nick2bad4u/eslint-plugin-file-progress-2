# recommended-ci

Use this preset when the same config is shared between local terminals and CI, and CI should suppress progress output entirely.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci"]];
```

## What it changes

It enables `file-progress/activate` and sets `hide` from the current process `CI` value.

That means:

- local runs still show live progress
- CI runs suppress live output and the final summary

If you want CI to hide live output but still print a summary, use [`recommended-ci-detailed`](./recommended-ci-detailed.md) instead.

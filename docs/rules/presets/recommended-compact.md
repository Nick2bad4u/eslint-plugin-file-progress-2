# recommended-compact

Use this preset when you want a live spinner but do not want per-file path repainting.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-compact"]];
```

## What it changes

- registers the `file-progress` plugin
- enables `file-progress/compact` at `warn`

This is the lowest-noise live mode the plugin ships with.

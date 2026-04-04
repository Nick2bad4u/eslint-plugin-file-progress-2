# `recommended-ci`

Use this preset when you want one shared preset that behaves well in both local terminals and CI.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci"]];
```

## What it changes

It enables the same rule as `recommended`, but also sets:

```ts
settings: {
  progress: {
    hide: process.env.CI === "true",
  },
}
```

That means:

- local runs still show progress output
- CI runs can stay quieter when `CI=true`

If your CI provider does not set `CI=true`, you can still override `settings.progress.hide` manually.

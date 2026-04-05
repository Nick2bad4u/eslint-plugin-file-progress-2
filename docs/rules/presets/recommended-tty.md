# recommended-tty

Use this preset when the config is shared across interactive terminals and non-interactive environments, and progress should only appear on a TTY.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-tty"]];
```

## What it changes

It enables `file-progress/activate` with:

```ts
{
  ttyOnly: true,
}
```

This is usually the safest preset for shared local/editor/automation configurations.

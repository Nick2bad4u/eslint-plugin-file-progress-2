# recommended

Use this preset when you want standard per-file progress during local ESLint CLI runs.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## Demo

[![Demo of the recommended preset showing live per-file progress output.](../../docusaurus/static/demos/presets/recommended.gif)](../../docusaurus/static/demos/presets/recommended.gif)

Notice how the default preset shows each file path live and then ends with a short success line.

[Recorded with Asciinema Recorder and Agg](https://docs.asciinema.org/manual/cli/)

[Download the recorded cast](../../docusaurus/static/demos/presets/casts/recommended.cast)

## Recommended + option overrides

If you like the `recommended` baseline but want to tune specific behavior, keep
the preset and layer a rule override after it.

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
  progress.configs.recommended,
  {
    rules: {
      "file-progress/activate": [
        "warn",
        {
          fileNameOnNewLine: true,
          pathFormat: "basename",
          throttleMs: 120,
        },
      ],
    },
  },
];
```

With `fileNameOnNewLine: true`, the live output format changes from a single
line into a two-line layout like this:

```txt
eslint-plugin-file-progress-2 • linting
  ↳ file-07.js
```

## What it enables

- registers the `file-progress` plugin
- enables `file-progress/activate` at `warn`
- leaves all rule options at their defaults

This is the best starting point for most local terminal workflows.

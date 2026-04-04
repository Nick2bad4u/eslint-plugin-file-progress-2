# `file-progress/activate`

This is the single public rule exported by the plugin.

## Purpose

When enabled during an ESLint CLI run, the rule:

- starts a spinner/progress indicator
- updates the currently displayed file being linted
- prints a success or failure summary when the run exits

## Basic configuration

```ts
import progress from "eslint-plugin-file-progress-2";

export default [
    {
        plugins: {
            "file-progress": progress,
        },
        rules: {
            "file-progress/activate": "warn",
        },
    },
];
```

## Settings

The rule reads its options from `settings.progress`.

```ts
export default [
    {
        plugins: {
            "file-progress": progress,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                hide: false,
                hideFileName: false,
                hidePrefix: false,
                hideDirectoryNames: false,
                fileNameOnNewLine: false,
                successMessage: "Lint done...",
                detailedSuccess: false,
                spinnerStyle: "dots",
                prefixMark: "•",
                successMark: "✔",
                failureMark: "✖",
            },
        },
    },
];
```

## Settings reference

### `hide`

Turns off progress output entirely.

### `hideFileName`

Shows a generic “linting project files...” message instead of per-file names.

### `hidePrefix`

Removes the plugin prefix from progress and summary lines.

### `hideDirectoryNames`

Shows only the filename segment during per-file updates.

### `fileNameOnNewLine`

Places the formatted file path on a second line under the progress prefix.

### `successMessage`

Overrides the default success message text.

### `detailedSuccess`

Enables a multi-line completion summary with:

- duration
- files linted
- throughput
- exit code
- problems summary

### `spinnerStyle`

Supported values:

- `line`
- `dots`
- `arc`
- `bounce`
- `clock`

### `prefixMark`, `successMark`, `failureMark`

Customize the symbols used in the progress prefix and completion lines.

## Practical notes

- `hidePrefix: true` ignores `fileNameOnNewLine` and keeps the output compact.
- `hideDirectoryNames: true` is helpful in deep repositories where the filename matters more than the full path.
- `recommended-ci` is a good default for shared configs because it suppresses noisy live progress when `CI` is set.

## Related pages

- [Overview](./overview.md)
- [Getting Started](./getting-started.md)
- [Preset Reference](./presets/index.md)

# eslint-plugin-file-progress-2

[![Version](https://badgen.net/npm/v/eslint-plugin-file-progress-2/latest)](https://www.npmjs.com/package/eslint-plugin-file-progress-2)
[![License](https://badgen.net/npm/license/eslint-plugin-file-progress-2?color=orange)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/blob/master/LICENSE)
[![Release](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/publish.yml/badge.svg)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/publish.yml)
[![Tests](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/workflows/Tests/badge.svg)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/test.yml)

> ESLint plugin to print file progress

> Fork note: Originally created by [@sibiraj-s](https://github.com/sibiraj-s) in [`eslint-plugin-file-progress`](https://github.com/sibiraj-s/eslint-plugin-file-progress). Huge thanks for the original plugin.

## Getting Started

### Installation

```bash
npm i -D eslint-plugin-file-progress-2
# or
yarn add --dev eslint-plugin-file-progress-2
```

### Usage

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [
    {
        name: "progress",
        plugins: {
            "file-progress": progress,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                hide: false, // hide progress output (useful in CI)
                hideFileName: false, // show generic "Linting..." instead of file names
                successMessage: "Lint done...",
                detailedSuccess: false, // show multi-line final summary (duration, file count, exit code)
                spinnerStyle: "dots", // line | dots | arc | bounce | clock
                prefixMark: "•", // marker after plugin name prefix in progress lines
                successMark: "✔", // custom mark used for success completion
                failureMark: "✖", // custom mark used for failure completion
            },
        },
    },
];
```

For slower lint runs, `spinnerStyle: "dots"` or `spinnerStyle: "arc"` generally feels smoother than `line`.
Directory segments are color-cycled to make deep paths easier to scan, while the filename stays emphasized.

When `detailedSuccess: true` is enabled, the summary includes duration, files linted, throughput, exit code, and a `Problems` line (`0` on successful runs).

Or use the recommended config

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

or if you want to hide the progress message in CI

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci"]];
```

or if you want detailed end-of-run stats enabled by default

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-detailed"]];
```

The `recommended-ci` preset is similar to the recommended one, but it automatically detects CI environments by checking if the `CI` environment variable is set to `true`, and hides the progress message accordingly.

The `recommended-detailed` preset enables the detailed success summary automatically.

For CI's where CI is not set to `true`, you can use the `settings.progress.hide` option to hide the progress message.

### Demo

Who likes a silent console ¯\\\_(ツ)\_/¯

![Progress](assets/progress.gif)

### Only on CLI

Some eslint plugins for code editors may conflict with this plugin rule (or, in that context, a file progress is not relevant)

```bash
npx eslint . --plugin file-progress --rule 'file-progress/activate: warn'
```

Or, in your package.json's command:

```diff
{
  "scripts": {
-    "lint": "eslint .",
+    "lint": "eslint . --plugin file-progress --rule \"file-progress/activate: warn\""
  }
}
```

Use `file-progress/activate: 0` to disable the plugin. See https://eslint.org/docs/latest/user-guide/command-line-interface#specifying-rules-and-plugins for more details on how to use CLI

## Contributing

Contributor and release documentation is available in [DEVELOPMENT.md](./DEVELOPMENT.md).

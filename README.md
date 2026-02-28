# eslint-plugin-file-progress-2

[![Version](https://badgen.net/npm/v/eslint-plugin-file-progress-2/latest)](https://www.npmjs.com/package/eslint-plugin-file-progress-2)
[![License](https://badgen.net/npm/license/eslint-plugin-file-progress-2?color=orange)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/blob/master/LICENSE)
[![Release](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/publish.yml/badge.svg)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/publish.yml)
[![Tests](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/workflows/Tests/badge.svg)](https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/actions/workflows/test.yml)

> ESLint plugin to print file progress

> Fork note: Originally created by [@sibiraj-s](https://github.com/sibiraj-s) in [`eslint-plugin-file-progress`](https://github.com/sibiraj-s/eslint-plugin-file-progress). Huge thanks for the original plugin.

## Getting Started

### Demo

- Who likes a silent console ¯\\\_(ツ)\_/¯

<div align="center">
  <img src="https://raw.githubusercontent.com/Nick2bad4u/eslint-plugin-file-progress-2/refs/heads/master/assets/progress-2.gif" alt="Progress Demo" width="100%">
    <img src="https://raw.githubusercontent.com/Nick2bad4u/eslint-plugin-file-progress-2/refs/heads/master/assets/summary-msg.png" alt="Detailed summary Demo" width="100%">
</div>

### Installation

```bash
npm i -D eslint-plugin-file-progress-2
# or
yarn add --dev eslint-plugin-file-progress-2
```

### Usage

#### Use the recommended config

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

#### Use the recommended CI config if you want the plugin to automatically hide progress in CI environments

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-ci"]];
```

#### Use the recommended detailed config if you want detailed end-of-run stats enabled by default

```js
// eslint.config.js
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs["recommended-detailed"]];
```

- The `recommended-ci` preset is similar to the recommended one, but it automatically detects CI environments by checking if the `CI` environment variable is set to `true`, and hides the progress message accordingly.

- The `recommended-detailed` preset enables the detailed success summary automatically.

- For CI's where CI is not set to `true`, you can use the `settings.progress.hide` option to hide the progress message.

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
                hidePrefix: false, // hide plugin prefix text before progress/summary output
                hideDirectoryNames: false, // show only the filename (no directory path segments)
                fileNameOnNewLine: false, // place filename on a second line under the linting prefix
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

- Directory segments are color-cycled to make deep paths easier to scan, while the filename stays emphasized.
- `hidePrefix: true` removes the plugin prefix from progress and summary lines. When enabled, `fileNameOnNewLine` is ignored and the filename/path is shown on a single line.
- `hideDirectoryNames: true` keeps per-file progress enabled but only shows the filename segment.
- `hidePrefix` and `hideDirectoryNames` can be combined (for example, to display only `file.ts` without any prefix text).
- When `detailedSuccess: true` is enabled, the summary includes duration, files linted, throughput, exit code, and a `Problems` line (`0` on successful runs, `detected` on failures).
- For slower lint runs, `spinnerStyle: "dots"` or `spinnerStyle: "arc"` generally feels smoother than `line`.

### Only on CLI

- Rarely, some ESLint plugins for code editors and IDEs may conflict with this plugin rule.
- In that case, configurations that enable the plugin may be used by the editor's ESLint integration and cause unwanted progress output in the editor console, or bugs.
- To avoid this, you can choose to only enable the plugin on the command line without adding it to your ESLint config, by passing the plugin and rule directly in the CLI:

```bash
npx eslint . --plugin file-progress --rule 'file-progress/activate: warn'
```

- Or, you can leave the plugin out of your ESLint config and create an npm script that includes the plugin and rule in the CLI:

```diff
{
  "scripts": {
     "lint": "eslint .",
+    "lint:progress": "eslint . --plugin file-progress --rule \"file-progress/activate: warn\""
  }
}
```

- Use `file-progress/activate: 0` to disable the plugin.
- See [ESLint CLI documentation](https://eslint.org/docs/latest/user-guide/command-line-interface#specifying-rules-and-plugins) for more details on how to use the NPM CLI.

## Contributing

- Contributor and release documentation is available in [DEVELOPMENT.md](./DEVELOPMENT.md).

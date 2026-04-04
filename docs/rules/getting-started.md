# Getting Started

Install the plugin:

```bash
npm install --save-dev eslint-plugin-file-progress-2
```

## Quick start with Flat Config

```ts
import progress from "eslint-plugin-file-progress-2";

export default [progress.configs.recommended];
```

## CommonJS example

```js
const progress = require("eslint-plugin-file-progress-2");

module.exports = [progress.configs.recommended];
```

## Preset choices

- `recommended`: standard progress output during local runs
- `recommended-ci`: automatically hides progress when `CI === "true"`
- `recommended-detailed`: enables the richer completion summary by default

## CLI-only usage

If you do not want editor integrations to see this rule, you can keep it out of your config and enable it directly from the CLI:

```bash
npx eslint . --plugin file-progress --rule 'file-progress/activate: warn'
```

You can also expose that through a package script:

```json
{
    "scripts": {
        "lint": "eslint .",
        "lint:progress": "eslint . --plugin file-progress --rule \"file-progress/activate: warn\""
    }
}
```

## Next step

Read the [preset guide](./presets/index.md) or jump straight to the [rule reference](./activate.md).

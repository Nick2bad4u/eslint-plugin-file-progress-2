---
"eslint-plugin-file-progress-2": patch
---

Prepare the next release with recent fixes to CI, linting, and packaging workflow.

1) Dual export map in package.json
- Switched package entrypoints to dual mode:
  - `"main": "./dist/index.cjs"`
  - `"module": "./dist/index.js"`
- Updated conditional exports:
  - `import.types` → index.d.ts
  - `import.default` → index.js
  - `require.types` → index.d.cts
  - `require.default` → index.cjs
- Set top-level `"types": "./dist/index.d.cts"` for CJS fallback typing compatibility.

2) Build pipeline updated
- `build` now runs:
  - TS ESM build
  - then CJS/type bridge generation script
- Script:
  - `"build": "npm run clean && tsc -p tsconfig.build.json && node write-cjs-entry.mjs"`

3) Added CJS generator script
- New file: write-cjs-entry.mjs
- It:
  - builds index.cjs via `esbuild` (bundled CJS artifact),
  - appends CJS interop footer so `require("eslint-plugin-file-progress-2")` returns the plugin object directly,
  - writes index.d.cts with `export = plugin`.

4) Added strict package-check scripts
- Added:
  - `"lint:package-check": "publint && attw --pack ."`
  - `"lint:package-check:strict": "publint && attw --pack . --profile strict --config-path .attw.json"`
  - `"lint:package:strict": "npm run lint:package-check:strict"`

5) Dependencies updated
- Added dev deps:
  - `@arethetypeswrong/cli`
  - `esbuild`
- package-lock.json updated accordingly.

6) README updated
- Added explicit **CommonJS usage** snippet (`eslint.config.cjs` + `require(...)`).

---
"eslint-plugin-file-progress": minor
---

Modernize the plugin with full TypeScript source/build pipeline, improve ESLint v10 support, and strengthen lint/test/release workflows.

### Highlights

- migrate source, types, and tests to TypeScript
- publish built artifacts from `dist/` with generated declarations
- update linting to use `@typescript-eslint/eslint-plugin` flat type-checked configuration
- expand tests for TypeScript integration and cross-platform path handling
- improve CI/release workflows to run full validation (`lint`, `typecheck`, `test`, `build`, `format:check`) before publish

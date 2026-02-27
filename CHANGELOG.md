# CHANGELOG

## 3.4.0

### Minor Changes

- ec2e352: Add additional progress output customization and richer end-of-run summaries.

    ### Highlights
    - add `prefixMark` to customize the prefix symbol independently from success/failure marks
    - improve final summary formatting (`plugin: status`) with configurable marks
    - add detailed summary throughput metric (`files/s`)
    - simplify detailed summary problem wording and improve path readability
    - add `recommended-detailed` preset to enable detailed end-of-run stats by default
    - show `Problems: detected` on failures instead of a placeholder count

### Patch Changes

- d5528f2: Adds new screenshots and demo section to the README, and adds a new preset with detailed end-of-run stats.

    ### Highlights
    - Added new screenshots to the README, showcasing the progress bar and detailed summary message.
    - Created a new preset configuration that includes a detailed summary message at the end of the ESLint
      run, showing the total number of files processed, errors, warnings, and the time taken.

## 3.3.0

### Minor Changes

- 2774d79: Add additional progress output customization and richer end-of-run summaries.

    ### Highlights
    - add `prefixMark` to customize the prefix symbol independently from success/failure marks
    - improve final summary formatting (`plugin: status`) with configurable marks
    - add detailed summary throughput metric (`files/s`)
    - simplify detailed summary problem wording and improve path readability
    - add `recommended-detailed` preset to enable detailed end-of-run stats by default

## 3.1.0

### Minor Changes

- 888f24b: Modernize the plugin with full TypeScript source/build pipeline, improve ESLint v10 support, and strengthen lint/test/release workflows.

    ### Highlights
    - migrate source, types, and tests to TypeScript
    - publish built artifacts from `dist/` with generated declarations
    - update linting to use `@typescript-eslint/eslint-plugin` flat type-checked configuration
    - expand tests for TypeScript integration and cross-platform path handling
    - improve CI/release workflows to run full validation (`lint`, `typecheck`, `test`, `build`, `format:check`) before publish

## 3.0.2

### Patch Changes

- fd02a52: hide status on exit with hide config option

## v3.0.1 (2024-11-09)

### Patch Changes

- fix `hide` option to hide the progress message ([4228208](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/4228208))
- add `hideFileName` option to hide the file name during linting ([4228208](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/4228208))

## v3.0.0 (2024-11-04)

### Breaking Changes

- rename `noCI` config to `recommended-ci` ([f67c68a](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/f67c68a))

## v2.1.2 (2024-11-04)

### Patch Changes

- fix namespace for configuration presets ([cdf1726](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/cdf1726))
- fix `noCI` type not exported ([50825d2](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/50825d2))

## v2.1.0 (2024-11-04)

### Features

- add `recommended` and `noCI` configs ([5a581b6](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/5a581b6))

## v2.0.1 (2024-11-04)

### Patch Changes

- fix supported nodejs version range for eslint ([66e6b0b](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/66e6b0b))

## v2.0.0 (2024-11-04)

### Breaking Changes

- require eslint v9 ([e593243](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/e593243))

## v1.5.0 (2024-08-12)

#### Dependency Updates

- replace `ora` with `nanospinner` ([96c5ccc](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/96c5ccc))
- replace `chalk` with `picocolors` ([96c5ccc](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/96c5ccc))

## v1.4.0 (2024-05-11)

#### Features

- support eslint v9 ([dd74d77](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/dd74d77))

## v1.3.0 (2022-06-27)

#### Features

- add option to hide progress ([21ae39a](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/21ae39a))
- add option to configure success message ([21ae39a](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/21ae39a))

#### Bug Fixes

- print path relative to eslint project ([9c4600d](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/9c4600d))

## v1.2.1 (2022-06-01)

#### Bug Fixes

- fix relative file path in windows ([9ebefd6](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/9ebefd6))

## v1.2.0 (2021-10-18)

#### Features

- support eslint v8 ([46e1e38](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/46e1e38))

#### Internal

- migrate to npm from yarn ([09c2da9](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/09c2da9))
- remove jest ([7fd164e](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/7fd164e))

## v1.1.1 (2020-12-13)

#### Internal

- update LICENSE ([d3a365e](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/d3a365e))

## v1.1.0 (2020-08-10)

#### Enhancements

- remove `cli-spinners` dependency ([9845971](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/9845971))
- color enhancements ([ee170ea](https://github.com/nick2bad4u/eslint-plugin-file-progress-2/commit/ee170ea))

## v1.0.0 (2020-08-09)

- **Initial Release**: Eslint plugin to print file progress

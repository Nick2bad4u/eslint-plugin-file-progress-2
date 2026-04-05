# Overview

`eslint-plugin-file-progress-2` adds a focused CLI experience layer to ESLint runs.

It prints live progress while files are being linted and can optionally emit a richer end-of-run summary once ESLint exits.

## What the plugin includes

- three public rules:
    - `file-progress/activate`
    - `file-progress/compact`
    - `file-progress/summary-only`
- three presets:
    - `recommended`
    - `recommended-ci`
    - `recommended-detailed`

## What the rule is designed for

The rule is aimed at terminal and CI-adjacent workflows where you want better feedback during long lint runs.

Common use cases:

- large repositories where `eslint .` feels silent for too long
- local developer runs where seeing the current file is helpful
- scripts where you want a final summary with duration and throughput

## What the rule is not trying to do

- It does **not** report lint problems itself; ESLint still does that.
- It does **not** change lint semantics or rule severity.
- It is **not** primarily intended for editor-integrated linting.

## Choosing a rule mode

- Use `file-progress/activate` when you want full per-file progress.
- Use `file-progress/compact` when you want visible activity but do not want file-path churn.
- Use `file-progress/summary-only` when you only care about the final completion summary.

If you only want the progress output on the command line, consider enabling the rule from the ESLint CLI instead of your editor-consumed config.

## Next step

Continue with [Getting Started](./getting-started.md) to install the plugin and choose a preset.

# Presets

The plugin ships with seven Flat Config-ready presets.

## Available presets

- [🟡 `recommended`](./recommended.md)
- [🟠 `recommended-ci`](./recommended-ci.md)
- [🔵 `recommended-detailed`](./recommended-detailed.md)
- [🟣 `recommended-compact`](./recommended-compact.md)
- [⚪ `recommended-summary-only`](./recommended-summary-only.md)
- [🟢 `recommended-tty`](./recommended-tty.md)
- [🟤 `recommended-ci-detailed`](./recommended-ci-detailed.md)

## Which preset should you choose?

- Choose [🟡 **recommended**](./recommended.md) for standard local CLI progress.
- Choose [🟠 **recommended-ci**](./recommended-ci.md) when CI should stay quiet.
- Choose [🔵 **recommended-detailed**](./recommended-detailed.md) when you want richer end-of-run stats.
- Choose [🟣 **recommended-compact**](./recommended-compact.md) when file names are unnecessary noise.
- Choose [⚪ **recommended-summary-only**](./recommended-summary-only.md) when only the final summary matters.
- Choose [🟢 **recommended-tty**](./recommended-tty.md) when the same config is reused in non-interactive environments.
- Choose [🟤 **recommended-ci-detailed**](./recommended-ci-detailed.md) when CI should avoid live output but still print a final detailed summary.

## Preset matrix

<!-- begin generated preset matrix -->
Generated from the preset registry.

| Preset | Rule | Key options | Intended use |
| --- | --- | --- | --- |
| [🟡 `recommended`](./recommended.md) | [`file-progress/activate`](../activate.md) | defaults | Default per-file progress for local CLI runs. |
| [🟠 `recommended-ci`](./recommended-ci.md) | [`file-progress/activate`](../activate.md) | `hide: CI === "true"` | Hide all plugin output in CI. |
| [🔵 `recommended-detailed`](./recommended-detailed.md) | [`file-progress/activate`](../activate.md) | `detailedSuccess: true` | Keep full per-file progress and enrich the final summary. |
| [🟣 `recommended-compact`](./recommended-compact.md) | [`file-progress/activate`](../activate.md) | `mode: "compact"` | Use compact live mode without per-file paths. |
| [⚪ `recommended-summary-only`](./recommended-summary-only.md) | [`file-progress/activate`](../activate.md) | `mode: "summary-only"` | Print only the final summary line. |
| [🟢 `recommended-tty`](./recommended-tty.md) | [`file-progress/activate`](../activate.md) | `ttyOnly: true` | Only show progress on interactive terminals. |
| [🟤 `recommended-ci-detailed`](./recommended-ci-detailed.md) | [`file-progress/activate`](../activate.md) | `detailedSuccess: true`, `hide: CI === "true"`, `showSummaryWhenHidden: CI === "true"` | Keep CI quiet while still printing a detailed final summary there. |
<!-- end generated preset matrix -->

---
"eslint-plugin-file-progress-2": patch
---

Publish a patch release with additional output controls and documentation updates.

- Added `settings.progress.hidePrefix` to remove plugin prefix text from progress and summary output.
- Added `settings.progress.hideDirectoryNames` to show only filenames (hide directory path segments).
- Ensured `hidePrefix` and `hideDirectoryNames` compose correctly with existing settings, including `fileNameOnNewLine`.
- Refreshed README settings documentation with the new configuration options.

import type { FileProgressRuleModule } from "../types.js";

import { getRuleCatalogEntry } from "../_internal/plugin-catalog.js";
import { createProgressRule } from "../_internal/progress-runtime.js";

const { docsUrl } = getRuleCatalogEntry("activate");

/**
 * Public ESLint rule module for `file-progress/activate`.
 */
const progressRule: FileProgressRuleModule = createProgressRule({
    defaultOptions: {},
    description: "Display live per-file lint progress in CLI output.",
    liveMode: "file",
    recommended: true,
    url: docsUrl,
});

export default progressRule;

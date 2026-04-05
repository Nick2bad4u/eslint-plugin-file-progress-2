import type { FileProgressRuleModule } from "../types.js";

import { getRuleCatalogEntry } from "../_internal/plugin-catalog.js";
import { createProgressRule } from "../_internal/progress-runtime.js";

const { docsUrl } = getRuleCatalogEntry("compact");

const compactRule: FileProgressRuleModule = createProgressRule({
    defaultOptions: {
        hideFileName: true,
    },
    description:
        "Display compact lint progress in CLI output without showing file names.",
    liveMode: "generic",
    ruleId: "compact",
    url: docsUrl,
});

export default compactRule;

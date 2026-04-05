import type { FileProgressRuleModule } from "../types.js";

import { getRuleCatalogEntry } from "../_internal/plugin-catalog.js";
import { createProgressRule } from "../_internal/progress-runtime.js";

const { docsUrl } = getRuleCatalogEntry("summary-only");

const summaryOnlyRule: FileProgressRuleModule = createProgressRule({
    defaultOptions: {},
    description:
        "Display only the final lint completion summary in CLI output.",
    liveMode: "summary-only",
    ruleId: "summary-only",
    url: docsUrl,
});

export default summaryOnlyRule;

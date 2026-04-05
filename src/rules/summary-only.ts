import type { FileProgressRuleModule } from "../types.js";

import { createProgressRule } from "../_internal/progress-runtime.js";

const summaryOnlyRule: FileProgressRuleModule = createProgressRule({
    description:
        "Display only the final lint completion summary in CLI output.",
    liveMode: "summary-only",
    ruleId: "summary-only",
    url: "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/docs/rules/summary-only",
});

export default summaryOnlyRule;

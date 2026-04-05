import type { FileProgressRuleModule } from "../types.js";

import { createProgressRule } from "../_internal/progress-runtime.js";

const compactRule: FileProgressRuleModule = createProgressRule({
    defaultOptions: {
        hideFileName: true,
    },
    description:
        "Display compact lint progress in CLI output without showing file names.",
    liveMode: "generic",
    ruleId: "compact",
    url: "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/docs/rules/compact",
});

export default compactRule;

import type { FileProgressRuleModule } from "../types.js";

import { createProgressRule } from "../_internal/progress-runtime.js";

const progressRule: FileProgressRuleModule = createProgressRule({
    defaultOptions: {},
    description: "Display lint progress in CLI output.",
    liveMode: "file",
    recommended: true,
    ruleId: "activate",
    url: "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/docs/rules/activate",
});

export default progressRule;

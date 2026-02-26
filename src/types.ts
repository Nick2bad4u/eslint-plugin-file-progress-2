import type { Linter, Rule } from "eslint";

export interface ProgressSettings {
    hide?: boolean;
    hideFileName?: boolean;
    successMessage?: string;
}

export interface FileProgressPlugin {
    meta: {
        name: "eslint-plugin-file-progress-2";
        version: string;
    };
    configs: {
        recommended: Linter.Config;
        "recommended-ci": Linter.Config;
    };
    rules: {
        activate: Rule.RuleModule;
    };
}

import type { Linter, Rule } from "eslint";

export type SpinnerStyle = "line" | "dots" | "arc" | "bounce" | "clock";

export interface ProgressSettings {
    hide?: boolean;
    hideFileName?: boolean;
    fileNameOnNewLine?: boolean;
    successMessage?: string;
    detailedSuccess?: boolean;
    spinnerStyle?: SpinnerStyle;
    prefixMark?: string;
    successMark?: string;
    failureMark?: string;
}

export interface FileProgressPlugin {
    meta: {
        name: "eslint-plugin-file-progress-2";
        version: string;
    };
    configs: {
        recommended: Linter.Config;
        "recommended-ci": Linter.Config;
        "recommended-detailed": Linter.Config;
    };
    rules: {
        activate: Rule.RuleModule;
    };
}

import type { Linter, Rule } from "eslint";

export interface FileProgressPlugin {
    configs: {
        recommended: Linter.Config;
        "recommended-ci": Linter.Config;
        "recommended-detailed": Linter.Config;
    };
    meta: {
        name: "eslint-plugin-file-progress-2";
        version: string;
    };
    rules: {
        activate: Rule.RuleModule;
    };
}

export interface ProgressSettings {
    detailedSuccess?: boolean;
    failureMark?: string;
    fileNameOnNewLine?: boolean;
    hide?: boolean;
    hideDirectoryNames?: boolean;
    hideFileName?: boolean;
    hidePrefix?: boolean;
    prefixMark?: string;
    spinnerStyle?: SpinnerStyle;
    successMark?: string;
    successMessage?: string;
}

export type SpinnerStyle = "arc" | "bounce" | "clock" | "dots" | "line";

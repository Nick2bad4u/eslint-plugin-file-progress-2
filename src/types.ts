import type { Linter, Rule } from "eslint";
import type { UnknownArray } from "type-fest";

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
        activate: FileProgressRuleModule;
        compact: FileProgressRuleModule;
        "summary-only": FileProgressRuleModule;
    };
}

export type FileProgressRuleContext = Readonly<{
    cwd: string;
    filename: string;
    settings: Rule.RuleContext["settings"];
}>;

export type FileProgressRuleListener = Record<
    string,
    ((...args: UnknownArray) => void) | undefined
>;

export interface FileProgressRuleMetaData {
    deprecated: boolean;
    docs: {
        description: string;
        frozen: boolean;
        recommended: boolean;
        url: string;
    };
    messages: Record<string, string>;
    schema: readonly [];
    type: "layout" | "problem" | "suggestion";
}

export interface FileProgressRuleModule {
    create: (context: FileProgressRuleContext) => FileProgressRuleListener;
    meta: FileProgressRuleMetaData;
    name?: string;
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

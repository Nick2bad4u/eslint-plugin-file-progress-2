import type { ESLint, Linter, Rule } from "eslint";

export type SpinnerStyle = "arc" | "bounce" | "clock" | "dots" | "line";

export type OutputStream = "stderr" | "stdout";

export type ProgressPathFormat = "relative" | "basename";

/**
 * Shared option object accepted by all rules.
 *
 * This same shape is also accepted by the deprecated `settings.progress`
 * fallback for backwards compatibility.
 */
export interface ProgressSettings {
    detailedSuccess?: boolean;
    failureMark?: string;
    fileNameOnNewLine?: boolean;
    hide?: boolean;
    /**
     * @deprecated Use `pathFormat: "basename"` instead.
     */
    hideDirectoryNames?: boolean;
    hideFileName?: boolean;
    hidePrefix?: boolean;
    minFilesBeforeShow?: number;
    outputStream?: OutputStream;
    pathFormat?: ProgressPathFormat;
    prefixMark?: string;
    showSummaryWhenHidden?: boolean;
    spinnerStyle?: SpinnerStyle;
    successMark?: string;
    successMessage?: string;
    throttleMs?: number;
    ttyOnly?: boolean;
}

export type ProgressRuleOptions = ProgressSettings;

export type ProgressRuleMessageIds = "status";

export type ProgressRuleOptionsTuple = [ProgressRuleOptions?];

type RuleSchema = NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;

type ProgressRuleDocs = Readonly<{
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    url: string;
}>;

export type FileProgressRuleMetaData = Omit<
    NonNullable<Rule.RuleModule["meta"]>,
    "docs" | "messages" | "schema"
> & {
    docs: ProgressRuleDocs;
    messages: Readonly<Record<ProgressRuleMessageIds, string>>;
    schema: RuleSchema;
};

export type FileProgressRuleModule = Omit<Rule.RuleModule, "meta"> & {
    defaultOptions: ProgressRuleOptionsTuple;
    meta: FileProgressRuleMetaData;
};

export type FileProgressConfigName =
    | "recommended"
    | "recommended-ci"
    | "recommended-ci-detailed"
    | "recommended-compact"
    | "recommended-detailed"
    | "recommended-summary-only"
    | "recommended-tty";

export type FileProgressRuleName = keyof FileProgressPlugin["rules"];

export interface FileProgressPlugin extends Omit<
    ESLint.Plugin,
    "configs" | "meta" | "rules"
> {
    configs: Readonly<Record<FileProgressConfigName, Linter.Config>>;
    meta: NonNullable<ESLint.Plugin["meta"]> & {
        name: "eslint-plugin-file-progress-2";
        namespace: "file-progress";
        version: string;
    };
    rules: {
        activate: FileProgressRuleModule;
        compact: FileProgressRuleModule;
        "summary-only": FileProgressRuleModule;
    };
}

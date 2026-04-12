import type { ESLint, Linter, Rule } from "eslint";
import type { Except } from "type-fest";

import type {
    FileProgressConfigName as CatalogFileProgressConfigName,
    FileProgressRuleName as CatalogFileProgressRuleName,
} from "./_internal/plugin-catalog.js";

export type FileProgressConfigName = CatalogFileProgressConfigName;

export interface FileProgressPlugin extends Except<
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
    };
}

export type FileProgressRuleMetaData = Except<
    NonNullable<Rule.RuleModule["meta"]>,
    "docs" | "messages" | "schema"
> & {
    docs: ProgressRuleDocs;
    messages: Readonly<Record<ProgressRuleMessageIds, string>>;
    schema: RuleSchema;
};

export type FileProgressRuleModule = Except<Rule.RuleModule, "meta"> & {
    defaultOptions: ProgressRuleOptionsTuple;
    meta: FileProgressRuleMetaData;
};

export type FileProgressRuleName = CatalogFileProgressRuleName;

export type OutputStream = "stderr" | "stdout";

export type ProgressMode = "compact" | "file" | "summary-only";

export type ProgressPathFormat = "basename" | "relative";

export type ProgressRuleMessageIds = "status";

export type ProgressRuleOptions = ProgressSettings;

export type ProgressRuleOptionsTuple = [ProgressRuleOptions?];

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
     * Legacy compatibility alias. Prefer `pathFormat: "basename"` instead.
     */
    hideDirectoryNames?: boolean;
    hideFileName?: boolean;
    hidePrefix?: boolean;
    minFilesBeforeShow?: number;
    mode?: ProgressMode;
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

export type SpinnerStyle = "arc" | "bounce" | "clock" | "dots" | "line";

type ProgressRuleDocs = Readonly<{
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    url: string;
}>;

type RuleSchema = NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;

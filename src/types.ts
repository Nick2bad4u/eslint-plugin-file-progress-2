import type { ESLint, Linter, Rule } from "eslint";
import type { Except } from "type-fest";

import type {
    FileProgressConfigName as CatalogFileProgressConfigName,
    FileProgressRuleName as CatalogFileProgressRuleName,
} from "./_internal/plugin-catalog.js";

/**
 * Union of all supported preset names.
 */
export type FileProgressConfigName = CatalogFileProgressConfigName;

/**
 * Public plugin contract exposed from the package entrypoint.
 */
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

/**
 * Strongly typed metadata shape for file-progress rule modules.
 */
export type FileProgressRuleMetaData = Except<
    NonNullable<Rule.RuleModule["meta"]>,
    "docs" | "messages" | "schema"
> & {
    docs: ProgressRuleDocs;
    messages: Readonly<Record<ProgressRuleMessageIds, string>>;
    schema: RuleSchema;
};

/**
 * Strongly typed rule module contract used by the plugin runtime.
 */
export type FileProgressRuleModule = Except<Rule.RuleModule, "meta"> & {
    defaultOptions: ProgressRuleOptionsTuple;
    meta: FileProgressRuleMetaData;
};

/**
 * Union of all supported public rule names.
 */
export type FileProgressRuleName = CatalogFileProgressRuleName;

/**
 * Writable output stream targeted by live progress output.
 */
export type OutputStream = "stderr" | "stdout";

/**
 * Live progress display mode.
 */
export type ProgressMode = "compact" | "file" | "summary-only";

/**
 * Path rendering mode used for file progress lines.
 */
export type ProgressPathFormat = "basename" | "relative";

/**
 * Message identifiers exposed by the rule metadata.
 */
export type ProgressRuleMessageIds = "status";

/**
 * Public option object accepted by the progress rule.
 */
export type ProgressRuleOptions = ProgressSettings;

/**
 * Tuple form used by ESLint for rule options.
 */
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

/**
 * Supported spinner styles for live progress output.
 */
export type SpinnerStyle = "arc" | "bounce" | "clock" | "dots" | "line";

type ProgressRuleDocs = Readonly<{
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    url: string;
}>;

type RuleSchema = NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;

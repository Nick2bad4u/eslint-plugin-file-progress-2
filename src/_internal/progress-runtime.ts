import type {
    FileProgressRuleModule,
    ProgressRuleMessageIds,
    ProgressRuleOptions,
} from "../types.js";
import {
    createProgressController,
    type ProgressLiveMode,
} from "./progress-controller.js";
import {
    defaultSettings,
    getLegacyProgressSettings,
    getRuleOptionSettings,
    mergeProgressSettings,
    normalizeSettings,
    progressOptionsSchema,
    resolveOutputStream,
    resolvePathFormat,
    resolveSpinnerStyle,
    type NormalizedProgressSettings,
} from "./progress-options.js";
import {
    formatDuration,
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    formatThroughput,
    toRelativeFilePath,
    type LintSummaryStats,
} from "./progress-formatting.js";

interface CreateProgressRuleOptions {
    readonly defaultOptions?: ProgressRuleOptions;
    readonly description: string;
    readonly liveMode: ProgressLiveMode;
    readonly recommended?: boolean;
    readonly ruleId: "activate" | "compact" | "summary-only";
    readonly url: string;
}

export interface ProgressInternals {
    readonly createProgressController: typeof createProgressController;
    readonly defaultSettings: Readonly<NormalizedProgressSettings>;
    readonly formatDuration: typeof formatDuration;
    readonly formatFailureMessage: typeof formatFailureMessage;
    readonly formatFileProgress: typeof formatFileProgress;
    readonly formatGenericProgress: typeof formatGenericProgress;
    readonly formatSuccessMessage: typeof formatSuccessMessage;
    readonly formatThroughput: typeof formatThroughput;
    readonly getLegacyProgressSettings: typeof getLegacyProgressSettings;
    readonly getRuleOptionSettings: typeof getRuleOptionSettings;
    readonly mergeProgressSettings: typeof mergeProgressSettings;
    readonly normalizeSettings: typeof normalizeSettings;
    readonly progressOptionsSchema: typeof progressOptionsSchema;
    readonly resolveOutputStream: typeof resolveOutputStream;
    readonly resolvePathFormat: typeof resolvePathFormat;
    readonly resolveSpinnerStyle: typeof resolveSpinnerStyle;
    readonly toRelativeFilePath: typeof toRelativeFilePath;
}

const sharedProgressController = createProgressController();

const createMeta = (
    options: CreateProgressRuleOptions
): FileProgressRuleModule["meta"] => ({
    deprecated: false,
    docs: {
        description: options.description,
        frozen: false,
        recommended: options.recommended ?? false,
        requiresTypeChecking: false,
        url: options.url,
    },
    messages: {
        status: options.description,
    } satisfies Record<ProgressRuleMessageIds, string>,
    schema: progressOptionsSchema,
    type: "suggestion",
});

export const createProgressRule = (
    options: CreateProgressRuleOptions
): FileProgressRuleModule => ({
    create(context) {
        sharedProgressController.handleLintFile({
            context,
            liveMode: options.liveMode,
        });

        return {};
    },
    defaultOptions: [options.defaultOptions ?? {}],
    meta: createMeta(options),
});

export const internals: ProgressInternals = {
    createProgressController,
    defaultSettings,
    formatDuration,
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    formatThroughput,
    getLegacyProgressSettings,
    getRuleOptionSettings,
    mergeProgressSettings,
    normalizeSettings,
    progressOptionsSchema,
    resolveOutputStream,
    resolvePathFormat,
    resolveSpinnerStyle,
    toRelativeFilePath,
};

export type { LintSummaryStats, NormalizedProgressSettings };

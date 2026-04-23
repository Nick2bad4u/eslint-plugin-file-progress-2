import type { Rule } from "eslint";
import type { UnknownArray, UnknownRecord } from "type-fest";

import {
    arrayFirst,
    arrayIncludes,
    isDefined,
    isInteger,
    keyIn,
    objectEntries,
} from "ts-extras";

import type {
    OutputStream,
    ProgressMode,
    ProgressPathFormat,
    ProgressRuleOptions,
    SpinnerStyle,
} from "../types.js";

/**
 * Fully normalized progress settings used at runtime.
 */
export interface NormalizedProgressSettings {
    readonly detailedSuccess: boolean;
    readonly failureMark: string;
    readonly fileNameOnNewLine: boolean;
    readonly hide: boolean;
    readonly hideFileName: boolean;
    readonly hidePrefix: boolean;
    readonly minFilesBeforeShow: number;
    readonly mode: ProgressMode | undefined;
    readonly outputStream: OutputStream;
    readonly pathFormat: ProgressPathFormat;
    readonly prefixMark: string;
    readonly showSummaryWhenHidden: boolean;
    readonly spinnerStyle: SpinnerStyle;
    readonly successMark: string;
    readonly successMessage: string;
    readonly throttleMs: number;
    readonly ttyOnly: boolean;
}

type ProgressSettingKey = keyof ProgressRuleOptions;

type RuleSchema = NonNullable<NonNullable<Rule.RuleModule["meta"]>["schema"]>;

const spinnerStyles = [
    "arc",
    "bounce",
    "clock",
    "dots",
    "line",
] as const;
const progressModes = [
    "file",
    "compact",
    "summary-only",
] as const;
const outputStreams = ["stderr", "stdout"] as const;
const pathFormats = ["relative", "basename"] as const;

/**
 * JSON schema describing the public rule options.
 */
export const progressOptionsSchema: RuleSchema = [
    {
        additionalProperties: false,
        properties: {
            detailedSuccess: {
                type: "boolean",
            },
            failureMark: {
                minLength: 1,
                type: "string",
            },
            fileNameOnNewLine: {
                type: "boolean",
            },
            hide: {
                type: "boolean",
            },
            hideDirectoryNames: {
                type: "boolean",
            },
            hideFileName: {
                type: "boolean",
            },
            hidePrefix: {
                type: "boolean",
            },
            minFilesBeforeShow: {
                minimum: 0,
                type: "integer",
            },
            mode: {
                enum: progressModes,
            },
            outputStream: {
                enum: outputStreams,
            },
            pathFormat: {
                enum: pathFormats,
            },
            prefixMark: {
                minLength: 1,
                type: "string",
            },
            showSummaryWhenHidden: {
                type: "boolean",
            },
            spinnerStyle: {
                enum: spinnerStyles,
            },
            successMark: {
                minLength: 1,
                type: "string",
            },
            successMessage: {
                minLength: 1,
                type: "string",
            },
            throttleMs: {
                minimum: 0,
                type: "integer",
            },
            ttyOnly: {
                type: "boolean",
            },
        },
        type: "object",
    },
] as const satisfies RuleSchema;

/**
 * Default runtime settings used when callers omit all options.
 */
export const defaultSettings: Readonly<NormalizedProgressSettings> =
    Object.freeze({
        detailedSuccess: false,
        failureMark: "✖",
        fileNameOnNewLine: false,
        hide: false,
        hideFileName: false,
        hidePrefix: false,
        minFilesBeforeShow: 0,
        mode: undefined,
        outputStream: "stderr",
        pathFormat: "relative",
        prefixMark: "•",
        showSummaryWhenHidden: false,
        spinnerStyle: "dots",
        successMark: "✔",
        successMessage: "Lint complete.",
        throttleMs: 0,
        ttyOnly: false,
    }) satisfies NormalizedProgressSettings;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null;

const isSpinnerStyle = (value: string): value is SpinnerStyle =>
    arrayIncludes(spinnerStyles, value as SpinnerStyle);

const isOutputStream = (value: string): value is OutputStream =>
    arrayIncludes(outputStreams, value as OutputStream);

const isProgressMode = (value: string): value is ProgressMode =>
    arrayIncludes(progressModes, value as ProgressMode);

const isProgressPathFormat = (value: string): value is ProgressPathFormat =>
    arrayIncludes(pathFormats, value as ProgressPathFormat);

const getBooleanSetting = (
    rawSettings: Readonly<UnknownRecord>,
    settingKey: ProgressSettingKey
): boolean =>
    keyIn(rawSettings, settingKey) && rawSettings[settingKey] === true;

const getNonNegativeIntegerSetting = (
    rawSettings: Readonly<UnknownRecord>,
    settingKey: ProgressSettingKey
): number | undefined => {
    if (!keyIn(rawSettings, settingKey)) {
        return undefined;
    }

    const settingValue = rawSettings[settingKey];

    if (
        typeof settingValue !== "number" ||
        !isInteger(settingValue) ||
        settingValue < 0
    ) {
        return undefined;
    }

    return settingValue;
};

const getStringSetting = (
    rawSettings: Readonly<UnknownRecord>,
    settingKey: ProgressSettingKey
): string | undefined => {
    if (!keyIn(rawSettings, settingKey)) {
        return undefined;
    }

    const settingValue = rawSettings[settingKey];

    return typeof settingValue === "string" ? settingValue : undefined;
};

/**
 * Reads the legacy shared `settings.progress` configuration, when present.
 *
 * @param settings - ESLint shared settings object.
 *
 * @returns Legacy progress settings value.
 */
export const getLegacyProgressSettings = (
    settings: Readonly<Rule.RuleContext["settings"]>
): unknown => {
    if (!isRecord(settings) || !keyIn(settings, "progress")) {
        return undefined;
    }

    return settings["progress"];
};

/**
 * Reads the first rule option object from the current rule context.
 *
 * @param context - ESLint rule context.
 *
 * @returns Raw rule option payload.
 */
export const getRuleOptionSettings = (
    context: Readonly<Rule.RuleContext>
): unknown => arrayFirst(context.options);

/**
 * Merges multiple raw settings objects into a single record.
 *
 * @param sources - Candidate settings sources ordered from lowest to highest
 *   precedence.
 *
 * @returns Merged settings record.
 */
export const mergeProgressSettings = (
    ...sources: Readonly<UnknownArray>
): Readonly<UnknownRecord> => {
    const mergedSettings: UnknownRecord = {};

    for (const source of sources) {
        if (!isRecord(source)) {
            continue;
        }

        for (const [key, value] of objectEntries(source)) {
            if (isDefined(value)) {
                mergedSettings[key] = value;
            }
        }
    }

    return mergedSettings;
};

const resolveMark = (rawMark: unknown, fallbackMark: string): string => {
    if (typeof rawMark !== "string") {
        return fallbackMark;
    }

    const trimmedMark = rawMark.trim();

    return trimmedMark.length > 0 ? trimmedMark : fallbackMark;
};

/**
 * Resolves a raw spinner style to a supported runtime value.
 *
 * @param rawStyle - Raw spinner style value.
 *
 * @returns Supported spinner style.
 */
export const resolveSpinnerStyle = (rawStyle: unknown): SpinnerStyle => {
    if (typeof rawStyle !== "string") {
        return defaultSettings.spinnerStyle;
    }

    return isSpinnerStyle(rawStyle) ? rawStyle : defaultSettings.spinnerStyle;
};

/**
 * Resolves a raw output stream value to a supported runtime value.
 *
 * @param rawStream - Raw output stream value.
 *
 * @returns Supported output stream.
 */
export const resolveOutputStream = (rawStream: unknown): OutputStream => {
    if (typeof rawStream !== "string") {
        return defaultSettings.outputStream;
    }

    return isOutputStream(rawStream) ? rawStream : defaultSettings.outputStream;
};

/**
 * Resolves a raw progress mode to a supported runtime value.
 *
 * @param rawMode - Raw progress mode value.
 *
 * @returns Supported progress mode, if any.
 */
export const resolveProgressMode = (
    rawMode: unknown
): ProgressMode | undefined => {
    if (typeof rawMode !== "string") {
        return defaultSettings.mode;
    }

    return isProgressMode(rawMode) ? rawMode : defaultSettings.mode;
};

/**
 * Resolves the path format, honoring the legacy `hideDirectoryNames` alias.
 *
 * @param rawPathFormat - Raw path format value.
 * @param rawHideDirectoryNames - Legacy compatibility toggle.
 *
 * @returns Supported path format.
 */
export const resolvePathFormat = (
    rawPathFormat: unknown,
    rawHideDirectoryNames: unknown
): ProgressPathFormat => {
    if (
        typeof rawPathFormat === "string" &&
        isProgressPathFormat(rawPathFormat)
    ) {
        return rawPathFormat;
    }

    return rawHideDirectoryNames === true
        ? "basename"
        : defaultSettings.pathFormat;
};

/**
 * Normalizes raw rule or shared settings into the runtime settings shape.
 *
 * @param raw - Raw settings value.
 *
 * @returns Fully normalized settings object.
 */
export const normalizeSettings = (raw: unknown): NormalizedProgressSettings => {
    if (!isRecord(raw)) {
        return { ...defaultSettings };
    }

    const successMessage = resolveMark(
        getStringSetting(raw, "successMessage"),
        defaultSettings.successMessage
    );

    return {
        detailedSuccess: getBooleanSetting(raw, "detailedSuccess"),
        failureMark: resolveMark(
            getStringSetting(raw, "failureMark"),
            defaultSettings.failureMark
        ),
        fileNameOnNewLine: getBooleanSetting(raw, "fileNameOnNewLine"),
        hide: getBooleanSetting(raw, "hide"),
        hideFileName: getBooleanSetting(raw, "hideFileName"),
        hidePrefix: getBooleanSetting(raw, "hidePrefix"),
        minFilesBeforeShow:
            getNonNegativeIntegerSetting(raw, "minFilesBeforeShow") ??
            defaultSettings.minFilesBeforeShow,
        mode: resolveProgressMode(getStringSetting(raw, "mode")),
        outputStream: resolveOutputStream(
            getStringSetting(raw, "outputStream")
        ),
        pathFormat: resolvePathFormat(
            getStringSetting(raw, "pathFormat"),
            keyIn(raw, "hideDirectoryNames")
                ? raw["hideDirectoryNames"]
                : undefined
        ),
        prefixMark: resolveMark(
            getStringSetting(raw, "prefixMark"),
            defaultSettings.prefixMark
        ),
        showSummaryWhenHidden: getBooleanSetting(raw, "showSummaryWhenHidden"),
        spinnerStyle: resolveSpinnerStyle(
            getStringSetting(raw, "spinnerStyle")
        ),
        successMark: resolveMark(
            getStringSetting(raw, "successMark"),
            defaultSettings.successMark
        ),
        successMessage,
        throttleMs:
            getNonNegativeIntegerSetting(raw, "throttleMs") ??
            defaultSettings.throttleMs,
        ttyOnly: getBooleanSetting(raw, "ttyOnly"),
    };
};

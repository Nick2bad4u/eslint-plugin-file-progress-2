import type { Rule } from "eslint";
import type { UnknownRecord } from "type-fest";

import { keyIn } from "ts-extras";

import type {
    OutputStream,
    ProgressPathFormat,
    ProgressRuleOptions,
    SpinnerStyle,
} from "../types.js";

export interface NormalizedProgressSettings {
    readonly detailedSuccess: boolean;
    readonly failureMark: string;
    readonly fileNameOnNewLine: boolean;
    readonly hide: boolean;
    readonly hideFileName: boolean;
    readonly hidePrefix: boolean;
    readonly minFilesBeforeShow: number;
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
const outputStreams = ["stderr", "stdout"] as const;
const pathFormats = ["relative", "basename"] as const;

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

export const defaultSettings: Readonly<NormalizedProgressSettings> =
    Object.freeze({
        detailedSuccess: false,
        failureMark: "✖",
        fileNameOnNewLine: false,
        hide: false,
        hideFileName: false,
        hidePrefix: false,
        minFilesBeforeShow: 0,
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
    spinnerStyles.includes(value as SpinnerStyle);

const isOutputStream = (value: string): value is OutputStream =>
    outputStreams.includes(value as OutputStream);

const isProgressPathFormat = (value: string): value is ProgressPathFormat =>
    pathFormats.includes(value as ProgressPathFormat);

const getBooleanSetting = (
    rawSettings: UnknownRecord,
    settingKey: ProgressSettingKey
): boolean =>
    keyIn(rawSettings, settingKey) && rawSettings[settingKey] === true;

const getNonNegativeIntegerSetting = (
    rawSettings: UnknownRecord,
    settingKey: ProgressSettingKey
): number | undefined => {
    if (!keyIn(rawSettings, settingKey)) {
        return undefined;
    }

    const settingValue = rawSettings[settingKey];

    if (
        typeof settingValue !== "number" ||
        !Number.isInteger(settingValue) ||
        settingValue < 0
    ) {
        return undefined;
    }

    return settingValue;
};

const getStringSetting = (
    rawSettings: UnknownRecord,
    settingKey: ProgressSettingKey
): string | undefined => {
    if (!keyIn(rawSettings, settingKey)) {
        return undefined;
    }

    const settingValue = rawSettings[settingKey];

    return typeof settingValue === "string" ? settingValue : undefined;
};

export const getLegacyProgressSettings = (
    settings: Rule.RuleContext["settings"]
): unknown => {
    if (!isRecord(settings) || !keyIn(settings, "progress")) {
        return undefined;
    }

    return settings["progress"];
};

export const getRuleOptionSettings = (context: Rule.RuleContext): unknown =>
    context.options[0];

export const mergeProgressSettings = (
    ...sources: readonly unknown[]
): Readonly<Record<string, unknown>> => {
    const mergedSettings: Record<string, unknown> = {};

    for (const source of sources) {
        if (!isRecord(source)) {
            continue;
        }

        for (const [key, value] of Object.entries(source)) {
            if (value !== undefined) {
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

export const resolveSpinnerStyle = (rawStyle: unknown): SpinnerStyle => {
    if (typeof rawStyle !== "string") {
        return defaultSettings.spinnerStyle;
    }

    return isSpinnerStyle(rawStyle) ? rawStyle : defaultSettings.spinnerStyle;
};

export const resolveOutputStream = (rawStream: unknown): OutputStream => {
    if (typeof rawStream !== "string") {
        return defaultSettings.outputStream;
    }

    return isOutputStream(rawStream) ? rawStream : defaultSettings.outputStream;
};

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

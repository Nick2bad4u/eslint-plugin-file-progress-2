import path from "node:path";
import type { Rule } from "eslint";
import { createSpinner, type Spinner } from "nanospinner";
import pc from "picocolors";

import type { ProgressSettings } from "../types.js";

export interface NormalizedProgressSettings {
    hide: boolean;
    hideFileName: boolean;
    successMessage: string;
}

export interface ProgressInternals {
    defaultSettings: Readonly<NormalizedProgressSettings>;
    normalizeSettings: (raw: unknown) => NormalizedProgressSettings;
    toRelativeFilePath: (filename: string, cwd: string) => string;
    formatFileProgress: (relativeFilePath: string) => string;
    formatGenericProgress: () => string;
    formatSuccessMessage: (settings: NormalizedProgressSettings) => string;
}

const spinner: Spinner = createSpinner("", {
    frames: ["|", "/", "-", "\\"],
    color: "cyan",
});

const defaultSettings: Readonly<NormalizedProgressSettings> = Object.freeze({
    hide: false,
    hideFileName: false,
    successMessage: "Lint complete.",
});

const pluginPrefix = `${pc.bold(pc.cyan("eslint-file-progress"))} ${pc.dim("•")}`;

let isExitHandlerBound = false;
let initialReportDone = false;
let lastVisibleSettings: NormalizedProgressSettings = { ...defaultSettings };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const normalizeSettings = (raw: unknown): NormalizedProgressSettings => {
    if (!isRecord(raw)) {
        return { ...defaultSettings };
    }

    const typedRaw = raw as ProgressSettings;

    const hide = typedRaw.hide === true;
    const hideFileName = typedRaw.hideFileName === true;
    const successMessage =
        typeof typedRaw.successMessage === "string" && typedRaw.successMessage.trim().length > 0
            ? typedRaw.successMessage.trim()
            : defaultSettings.successMessage;

    return {
        hide,
        hideFileName,
        successMessage,
    };
};

const toRelativeFilePath = (filename: string, cwd: string): string => {
    if (!filename || filename === "<input>") {
        return filename || "<input>";
    }

    if (!path.isAbsolute(filename)) {
        return filename;
    }

    const relativePath = path.relative(cwd || process.cwd(), filename);

    if (relativePath.length === 0) {
        return path.basename(filename);
    }

    return relativePath;
};

const formatFileProgress = (relativeFilePath: string): string =>
    `${pluginPrefix} ${pc.dim("linting")} ${pc.green(relativeFilePath)}`;

const formatGenericProgress = (): string => `${pluginPrefix} ${pc.dim("linting project files...")}`;

const formatSuccessMessage = (settings: NormalizedProgressSettings): string =>
    `${pluginPrefix} ${pc.bold(pc.green("✔"))} ${pc.green(settings.successMessage)}`;

const bindExitHandler = (): void => {
    if (isExitHandlerBound) {
        return;
    }

    process.once("exit", (exitCode) => {
        if (exitCode === 0 && lastVisibleSettings.hide !== true) {
            spinner.success({ text: formatSuccessMessage(lastVisibleSettings) });
        }
    });

    isExitHandlerBound = true;
};

const create = (context: Rule.RuleContext): Rule.RuleListener => {
    const settings = normalizeSettings(
        (context.settings as { progress?: unknown } | undefined)?.progress,
    );

    bindExitHandler();

    if (settings.hide) {
        return {};
    }

    lastVisibleSettings = settings;

    if (settings.hideFileName) {
        if (!initialReportDone) {
            spinner.update({ text: formatGenericProgress() });
            initialReportDone = true;
        }
    } else {
        const relativeFilePath = toRelativeFilePath(context.filename, context.cwd);
        spinner.update({ text: formatFileProgress(relativeFilePath) });
    }

    spinner.spin();

    return {};
};

const progressRule: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Display lint progress in CLI output.",
            url: "https://github.com/sibiraj-s/eslint-plugin-file-progress#readme",
        },
        messages: {
            status: "Display lint progress in CLI output.",
        },
        schema: [],
    },
    create,
};

export const internals: ProgressInternals = {
    defaultSettings,
    normalizeSettings,
    toRelativeFilePath,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
};

export default progressRule;

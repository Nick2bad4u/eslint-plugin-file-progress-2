import type { Rule } from "eslint";

import { createSpinner, type Spinner } from "nanospinner";

import type { OutputStream, SpinnerStyle } from "../types.js";
import {
    type NormalizedProgressSettings,
    defaultSettings,
    getLegacyProgressSettings,
    getRuleOptionSettings,
    mergeProgressSettings,
    normalizeSettings,
} from "./progress-options.js";
import {
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    type LintSummaryStats,
    toRelativeFilePath,
} from "./progress-formatting.js";

export type ProgressLiveMode = "file" | "generic" | "summary-only";

type SpinnerCreateOptions = NonNullable<Parameters<typeof createSpinner>[1]>;

type SpinnerFactory = (text?: string, opts?: SpinnerCreateOptions) => Spinner;

type ProcessLike = Pick<NodeJS.Process, "cwd" | "once" | "stderr" | "stdout">;

interface ProgressControllerDependencies {
    readonly now?: () => number;
    readonly process?: ProcessLike;
    readonly spinnerFactory?: SpinnerFactory;
}

interface ProgressControllerState {
    activeOutputStream: OutputStream;
    activeSpinnerStyle: SpinnerStyle;
    exitHandlerBound: boolean;
    initialLiveReportDone: boolean;
    lastRenderAt: number;
    lastResolvedSettings: NormalizedProgressSettings;
    lintStartedAt: number;
    lintedFileCount: number;
    spinner: Spinner;
}

export interface ProgressController {
    getState: () => Readonly<ProgressControllerState>;
    handleExit: (exitCode: number) => void;
    handleLintFile: (input: {
        readonly context: Rule.RuleContext;
        readonly liveMode: ProgressLiveMode;
    }) => void;
    reset: () => void;
}

const spinnerPresets = {
    arc: {
        frames: [
            "◜",
            "◠",
            "◝",
            "◞",
            "◡",
            "◟",
        ],
        interval: 90,
    },
    bounce: {
        frames: [
            "▖",
            "▘",
            "▝",
            "▗",
        ],
        interval: 120,
    },
    clock: {
        frames: [
            "🕛",
            "🕐",
            "🕑",
            "🕒",
            "🕓",
            "🕔",
            "🕕",
            "🕖",
            "🕗",
            "🕘",
            "🕙",
            "🕚",
        ],
        interval: 120,
    },
    dots: {
        frames: [
            "⠋",
            "⠙",
            "⠹",
            "⠸",
            "⠼",
            "⠴",
            "⠦",
            "⠧",
            "⠇",
            "⠏",
        ],
        interval: 80,
    },
    line: {
        frames: [
            "|",
            "/",
            "-",
            "\\",
        ],
        interval: 90,
    },
} satisfies Record<
    SpinnerStyle,
    { readonly frames: readonly string[]; readonly interval: number }
>;

const applyRuleMode = (
    settings: NormalizedProgressSettings,
    liveMode: ProgressLiveMode
): NormalizedProgressSettings => {
    if (liveMode === "generic") {
        return {
            ...settings,
            hideFileName: true,
        };
    }

    return settings;
};

const resolveWriteStream = (
    processLike: ProcessLike,
    outputStream: OutputStream
): NodeJS.WriteStream =>
    outputStream === "stdout" ? processLike.stdout : processLike.stderr;

const isOutputHidden = (
    settings: NormalizedProgressSettings,
    lintedFileCount: number,
    processLike: ProcessLike
): boolean => {
    if (settings.hide) {
        return true;
    }

    if (lintedFileCount < settings.minFilesBeforeShow) {
        return true;
    }

    if (!settings.ttyOnly) {
        return false;
    }

    return (
        resolveWriteStream(processLike, settings.outputStream).isTTY !== true
    );
};

const shouldRenderLiveOutput = (
    settings: NormalizedProgressSettings,
    lintedFileCount: number,
    liveMode: ProgressLiveMode,
    processLike: ProcessLike
): boolean =>
    liveMode !== "summary-only" &&
    !isOutputHidden(settings, lintedFileCount, processLike);

const shouldRenderSummary = (
    settings: NormalizedProgressSettings,
    lintedFileCount: number,
    processLike: ProcessLike
): boolean =>
    !isOutputHidden(settings, lintedFileCount, processLike) ||
    settings.showSummaryWhenHidden;

export const createProgressController = (
    dependencies: ProgressControllerDependencies = {}
): ProgressController => {
    const now = dependencies.now ?? Date.now;
    const processLike = dependencies.process ?? process;
    const spinnerFactory = dependencies.spinnerFactory ?? createSpinner;

    const createManagedSpinner = (
        settings: NormalizedProgressSettings
    ): Spinner => {
        const spinnerPreset = spinnerPresets[settings.spinnerStyle];

        return spinnerFactory("", {
            color: "cyan",
            frames: [...spinnerPreset.frames],
            interval: spinnerPreset.interval,
            stream: resolveWriteStream(processLike, settings.outputStream),
        });
    };

    const createInitialState = (): ProgressControllerState => ({
        activeOutputStream: defaultSettings.outputStream,
        activeSpinnerStyle: defaultSettings.spinnerStyle,
        exitHandlerBound: false,
        initialLiveReportDone: false,
        lastRenderAt: 0,
        lastResolvedSettings: { ...defaultSettings },
        lintStartedAt: 0,
        lintedFileCount: 0,
        spinner: createManagedSpinner(defaultSettings),
    });

    let state = createInitialState();

    const ensureSpinner = (settings: NormalizedProgressSettings): void => {
        if (
            settings.outputStream === state.activeOutputStream &&
            settings.spinnerStyle === state.activeSpinnerStyle
        ) {
            return;
        }

        if (state.spinner.isSpinning()) {
            state.spinner.stop({ update: false });
        }

        state.activeOutputStream = settings.outputStream;
        state.activeSpinnerStyle = settings.spinnerStyle;
        state.spinner = createManagedSpinner(settings);
    };

    const bindExitHandler = (): void => {
        if (state.exitHandlerBound) {
            return;
        }

        processLike.once("exit", (exitCode) => {
            if (typeof exitCode === "number") {
                controller.handleExit(exitCode);
            }
        });
        state.exitHandlerBound = true;
    };

    const renderLiveOutput = (
        context: Rule.RuleContext,
        settings: NormalizedProgressSettings,
        liveMode: ProgressLiveMode
    ): void => {
        if (liveMode === "generic" || settings.hideFileName) {
            if (!state.initialLiveReportDone) {
                state.spinner.update({ text: formatGenericProgress(settings) });
                state.initialLiveReportDone = true;
                state.lastRenderAt = now();
            }

            state.spinner.spin();
            return;
        }

        const renderAt = now();

        if (
            state.initialLiveReportDone &&
            settings.throttleMs > 0 &&
            renderAt - state.lastRenderAt < settings.throttleMs
        ) {
            state.spinner.spin();
            return;
        }

        const relativeFilePath = toRelativeFilePath(
            context.filename,
            context.cwd
        );
        state.spinner.update({
            text: formatFileProgress(relativeFilePath, settings),
        });
        state.initialLiveReportDone = true;
        state.lastRenderAt = renderAt;
        state.spinner.spin();
    };

    const resolveSettings = (
        context: Rule.RuleContext,
        liveMode: ProgressLiveMode
    ): NormalizedProgressSettings =>
        applyRuleMode(
            normalizeSettings(
                mergeProgressSettings(
                    getLegacyProgressSettings(context.settings),
                    getRuleOptionSettings(context)
                )
            ),
            liveMode
        );

    const createSummaryStats = (exitCode: number): LintSummaryStats => ({
        durationMs:
            state.lintStartedAt > 0
                ? Math.max(0, now() - state.lintStartedAt)
                : 0,
        exitCode,
        filesLinted: state.lintedFileCount,
    });

    const controller: ProgressController = {
        getState: () => state,
        handleExit(exitCode): void {
            if (state.lintedFileCount === 0) {
                return;
            }

            const settings = state.lastResolvedSettings;

            if (
                !shouldRenderSummary(
                    settings,
                    state.lintedFileCount,
                    processLike
                )
            ) {
                return;
            }

            ensureSpinner(settings);

            const summaryStats = createSummaryStats(exitCode);

            if (exitCode === 0) {
                state.spinner.success({
                    mark: settings.hidePrefix ? "" : settings.prefixMark,
                    text: formatSuccessMessage(settings, summaryStats),
                });
                return;
            }

            state.spinner.error({
                mark: settings.hidePrefix ? "" : settings.prefixMark,
                text: formatFailureMessage(settings, summaryStats),
            });
        },
        handleLintFile({ context, liveMode }): void {
            if (state.lintStartedAt === 0) {
                state.lintStartedAt = now();
            }

            state.lintedFileCount += 1;

            const settings = resolveSettings(context, liveMode);
            state.lastResolvedSettings = settings;

            bindExitHandler();

            const shouldShowSummary = shouldRenderSummary(
                settings,
                state.lintedFileCount,
                processLike
            );
            const shouldShowLiveOutput = shouldRenderLiveOutput(
                settings,
                state.lintedFileCount,
                liveMode,
                processLike
            );

            if (!shouldShowLiveOutput && !shouldShowSummary) {
                return;
            }

            ensureSpinner(settings);

            if (!shouldShowLiveOutput) {
                return;
            }

            renderLiveOutput(context, settings, liveMode);
        },
        reset(): void {
            if (state.spinner.isSpinning()) {
                state.spinner.stop({ update: false });
            }

            state = createInitialState();
        },
    };

    return controller;
};

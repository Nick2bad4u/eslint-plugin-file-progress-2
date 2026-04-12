import type { Rule } from "eslint";

import { createSpinner, type Spinner } from "nanospinner";
import { isDefined } from "ts-extras";

import type { OutputStream, ProgressMode, SpinnerStyle } from "../types.js";

import {
    formatFailureMessage,
    formatFileProgress,
    formatGenericProgress,
    formatSuccessMessage,
    type LintSummaryStats,
    toRelativeFilePath,
} from "./progress-formatting.js";
import {
    defaultSettings,
    getLegacyProgressSettings,
    getRuleOptionSettings,
    mergeProgressSettings,
    type NormalizedProgressSettings,
    normalizeSettings,
} from "./progress-options.js";

export interface ProgressController {
    getState: () => Readonly<ProgressControllerState>;
    handleExit: (exitCode: number) => void;
    handleLintFile: (input: {
        readonly context: Rule.RuleContext;
        readonly liveMode: ProgressLiveMode;
    }) => void;
    reset: () => void;
}

export type ProgressLiveMode = "file" | "generic" | "summary-only";

type ProcessLike = Pick<typeof process, "cwd" | "once" | "stderr" | "stdout">;

interface ProgressControllerDependencies {
    readonly now?: () => number;
    readonly process?: ProcessLike;
    readonly spinnerFactory?: SpinnerFactory;
}

interface ProgressControllerState {
    activeOutputStream: OutputStream;
    activeSpinnerStyle: SpinnerStyle;
    exitHandlerBound: boolean;
    finalStatusHandled: boolean;
    initialLiveReportDone: boolean;
    lastRenderAt: number;
    lastResolvedSettings: NormalizedProgressSettings;
    lintedFileCount: number;
    lintStartedAt: number;
    spinner: Spinner;
}

type SpinnerCreateOptions = NonNullable<Parameters<typeof createSpinner>[1]>;

type SpinnerFactory = (text?: string, opts?: SpinnerCreateOptions) => Spinner;

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

const modeToLiveMode = {
    compact: "generic",
    file: "file",
    "summary-only": "summary-only",
} as const satisfies Record<ProgressMode, ProgressLiveMode>;

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

const resolveLiveModeFromProgressMode = (
    mode: ProgressMode | undefined
): ProgressLiveMode | undefined => {
    if (isDefined(mode)) {
        return modeToLiveMode[mode];
    }

    return undefined;
};

const resolveEffectiveLiveMode = (
    settings: NormalizedProgressSettings,
    liveMode: ProgressLiveMode
): ProgressLiveMode => {
    const modeFromSettings = resolveLiveModeFromProgressMode(settings.mode);

    if (isDefined(modeFromSettings)) {
        return modeFromSettings;
    }

    return liveMode;
};

const resolveWriteStream = (
    processLike: ProcessLike,
    outputStream: OutputStream
): ProcessLike["stderr"] | ProcessLike["stdout"] =>
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

    return !resolveWriteStream(processLike, settings.outputStream).isTTY;
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
        finalStatusHandled: false,
        initialLiveReportDone: false,
        lastRenderAt: 0,
        lastResolvedSettings: { ...defaultSettings },
        lintedFileCount: 0,
        lintStartedAt: 0,
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
    ): {
        readonly effectiveLiveMode: ProgressLiveMode;
        readonly settings: NormalizedProgressSettings;
    } => {
        const normalizedSettings = normalizeSettings(
            mergeProgressSettings(
                getLegacyProgressSettings(context.settings),
                getRuleOptionSettings(context)
            )
        );
        const effectiveLiveMode = resolveEffectiveLiveMode(
            normalizedSettings,
            liveMode
        );

        return {
            effectiveLiveMode,
            settings: applyRuleMode(normalizedSettings, effectiveLiveMode),
        };
    };

    const createSummaryStats = (exitCode: number): LintSummaryStats => ({
        durationMs:
            state.lintStartedAt > 0
                ? Math.max(0, now() - state.lintStartedAt)
                : 0,
        exitCode,
        filesLinted: state.lintedFileCount,
    });

    const handleExit = (exitCode: number): void => {
        if (state.finalStatusHandled) {
            return;
        }

        if (state.lintedFileCount === 0) {
            return;
        }

        const settings = state.lastResolvedSettings;

        if (
            !shouldRenderSummary(settings, state.lintedFileCount, processLike)
        ) {
            if (state.spinner.isSpinning()) {
                state.spinner.stop({ update: false });
            }

            state.finalStatusHandled = true;
            return;
        }

        ensureSpinner(settings);

        const summaryStats = createSummaryStats(exitCode);

        if (exitCode === 0) {
            state.spinner.success({
                mark: settings.hidePrefix ? "" : settings.prefixMark,
                text: formatSuccessMessage(settings, summaryStats),
            });
            state.finalStatusHandled = true;
            return;
        }

        state.spinner.error({
            mark: settings.hidePrefix ? "" : settings.prefixMark,
            text: formatFailureMessage(settings, summaryStats),
        });
        state.finalStatusHandled = true;
    };

    const bindExitHandler = (): void => {
        if (state.exitHandlerBound) {
            return;
        }

        processLike.once("exit", (exitCode) => {
            if (typeof exitCode === "number") {
                handleExit(exitCode);
            }
        });

        processLike.once("beforeExit", (exitCode) => {
            handleExit(typeof exitCode === "number" ? exitCode : 0);
        });

        state.exitHandlerBound = true;
    };

    return {
        getState: () => state,
        handleExit,
        handleLintFile({ context, liveMode }): void {
            if (state.lintStartedAt === 0) {
                state.lintStartedAt = now();
            }

            state.lintedFileCount += 1;

            const { effectiveLiveMode, settings } = resolveSettings(
                context,
                liveMode
            );
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
                effectiveLiveMode,
                processLike
            );

            if (!shouldShowLiveOutput && !shouldShowSummary) {
                return;
            }

            ensureSpinner(settings);

            if (!shouldShowLiveOutput) {
                return;
            }

            renderLiveOutput(context, settings, effectiveLiveMode);
        },
        reset(): void {
            if (state.spinner.isSpinning()) {
                state.spinner.stop({ update: false });
            }

            state = createInitialState();
        },
    } satisfies ProgressController;
};

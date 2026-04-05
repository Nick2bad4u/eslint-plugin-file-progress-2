const docsBaseUrl =
    "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/docs/rules";

export const fileProgressRuleNames = [
    "activate",
    "compact",
    "summary-only",
] as const;

export interface FileProgressRuleCatalogEntry {
    readonly docsId: string;
    readonly docsPath: string;
    readonly docsUrl: string;
    readonly name: (typeof fileProgressRuleNames)[number];
    readonly navbarLabel: string;
    readonly sidebarLabel: string;
}

export type FileProgressRuleName = (typeof fileProgressRuleNames)[number];

export const fileProgressRuleCatalogByName: Readonly<
    Record<FileProgressRuleName, FileProgressRuleCatalogEntry>
> = {
    activate: {
        docsId: "activate",
        docsPath: "./docs/rules/activate.md",
        docsUrl: `${docsBaseUrl}/activate`,
        name: "activate",
        navbarLabel: "• file-progress/activate",
        sidebarLabel: "01 file-progress/activate",
    },
    compact: {
        docsId: "compact",
        docsPath: "./docs/rules/compact.md",
        docsUrl: `${docsBaseUrl}/compact`,
        name: "compact",
        navbarLabel: "• file-progress/compact",
        sidebarLabel: "02 file-progress/compact",
    },
    "summary-only": {
        docsId: "summary-only",
        docsPath: "./docs/rules/summary-only.md",
        docsUrl: `${docsBaseUrl}/summary-only`,
        name: "summary-only",
        navbarLabel: "• file-progress/summary-only",
        sidebarLabel: "03 file-progress/summary-only",
    },
};

export const fileProgressRuleCatalog: readonly FileProgressRuleCatalogEntry[] =
    fileProgressRuleNames.map(
        (ruleName) => fileProgressRuleCatalogByName[ruleName]
    );

export const fileProgressPresetNames = [
    "recommended",
    "recommended-ci",
    "recommended-detailed",
    "recommended-compact",
    "recommended-summary-only",
    "recommended-tty",
    "recommended-ci-detailed",
] as const;

export type FileProgressConfigName = (typeof fileProgressPresetNames)[number];

export interface FileProgressPresetCatalogEntry {
    readonly docsId: string;
    readonly docsPath: string;
    readonly name: (typeof fileProgressPresetNames)[number];
    readonly navbarLabel: string;
    readonly optionSummary: string;
    readonly purpose: string;
    readonly ruleName: FileProgressRuleName;
    readonly sidebarClassName: string;
    readonly sidebarLabel: string;
}

export const fileProgressPresetCatalogByName: Readonly<
    Record<FileProgressConfigName, FileProgressPresetCatalogEntry>
> = {
    recommended: {
        docsId: "presets/recommended",
        docsPath: "./docs/rules/presets/recommended.md",
        name: "recommended",
        navbarLabel: "🟡 Recommended",
        optionSummary: "defaults",
        purpose: "Default per-file progress for local CLI runs.",
        ruleName: "activate",
        sidebarClassName: "sb-preset-recommended",
        sidebarLabel: "🟡 Recommended",
    },
    "recommended-ci": {
        docsId: "presets/recommended-ci",
        docsPath: "./docs/rules/presets/recommended-ci.md",
        name: "recommended-ci",
        navbarLabel: "🟠 Recommended CI",
        optionSummary: '`hide: CI === "true"`',
        purpose: "Hide all plugin output in CI.",
        ruleName: "activate",
        sidebarClassName: "sb-preset-recommended-ci",
        sidebarLabel: "🟠 Recommended CI",
    },
    "recommended-ci-detailed": {
        docsId: "presets/recommended-ci-detailed",
        docsPath: "./docs/rules/presets/recommended-ci-detailed.md",
        name: "recommended-ci-detailed",
        navbarLabel: "🟤 Recommended CI Detailed",
        optionSummary:
            '`detailedSuccess: true`, `hide: CI === "true"`, `showSummaryWhenHidden: CI === "true"`',
        purpose:
            "Keep CI quiet while still printing a detailed final summary there.",
        ruleName: "activate",
        sidebarClassName: "sb-preset-recommended-ci-detailed",
        sidebarLabel: "🟤 Recommended CI Detailed",
    },
    "recommended-compact": {
        docsId: "presets/recommended-compact",
        docsPath: "./docs/rules/presets/recommended-compact.md",
        name: "recommended-compact",
        navbarLabel: "🟣 Recommended Compact",
        optionSummary: "defaults",
        purpose: "Use compact live mode without per-file paths.",
        ruleName: "compact",
        sidebarClassName: "sb-preset-recommended-compact",
        sidebarLabel: "🟣 Recommended Compact",
    },
    "recommended-detailed": {
        docsId: "presets/recommended-detailed",
        docsPath: "./docs/rules/presets/recommended-detailed.md",
        name: "recommended-detailed",
        navbarLabel: "🔵 Recommended Detailed",
        optionSummary: "`detailedSuccess: true`",
        purpose: "Keep full per-file progress and enrich the final summary.",
        ruleName: "activate",
        sidebarClassName: "sb-preset-recommended-detailed",
        sidebarLabel: "🔵 Recommended Detailed",
    },
    "recommended-summary-only": {
        docsId: "presets/recommended-summary-only",
        docsPath: "./docs/rules/presets/recommended-summary-only.md",
        name: "recommended-summary-only",
        navbarLabel: "⚪ Recommended Summary Only",
        optionSummary: "defaults",
        purpose: "Print only the final summary line.",
        ruleName: "summary-only",
        sidebarClassName: "sb-preset-recommended-summary-only",
        sidebarLabel: "⚪ Recommended Summary Only",
    },
    "recommended-tty": {
        docsId: "presets/recommended-tty",
        docsPath: "./docs/rules/presets/recommended-tty.md",
        name: "recommended-tty",
        navbarLabel: "🟢 Recommended TTY",
        optionSummary: "`ttyOnly: true`",
        purpose: "Only show progress on interactive terminals.",
        ruleName: "activate",
        sidebarClassName: "sb-preset-recommended-tty",
        sidebarLabel: "🟢 Recommended TTY",
    },
};

export const fileProgressPresetCatalog: readonly FileProgressPresetCatalogEntry[] =
    fileProgressPresetNames.map(
        (presetName) => fileProgressPresetCatalogByName[presetName]
    );

export const getRuleCatalogEntry = (
    ruleName: FileProgressRuleName
): FileProgressRuleCatalogEntry => fileProgressRuleCatalogByName[ruleName];

export const getPresetCatalogEntry = (
    presetName: FileProgressConfigName
): FileProgressPresetCatalogEntry =>
    fileProgressPresetCatalogByName[presetName];

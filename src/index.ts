import type { Linter } from "eslint";

import type {
    FileProgressConfigName,
    FileProgressPlugin,
    FileProgressRuleName,
    ProgressRuleOptions,
    ProgressRuleOptionsTuple,
} from "./types.js";

import packageJson from "../package.json" with { type: "json" };
import compactRule from "./rules/compact.js";
import progressRule from "./rules/progress.js";
import summaryOnlyRule from "./rules/summary-only.js";

const isCi = globalThis.process.env["CI"] === "true";

const createRuleEntry = (
    options?: ProgressRuleOptions
): Linter.RuleEntry<ProgressRuleOptionsTuple> =>
    options === undefined ? "warn" : ["warn", options];

const pluginCore = {
    meta: {
        name: "eslint-plugin-file-progress-2",
        namespace: "file-progress",
        version: packageJson.version,
    },
    rules: {
        activate: progressRule,
        compact: compactRule,
        "summary-only": summaryOnlyRule,
    },
} satisfies Omit<FileProgressPlugin, "configs">;

const createPresetConfig = (
    configName: FileProgressConfigName,
    ruleName: FileProgressRuleName,
    options?: ProgressRuleOptions
): Linter.Config => ({
    name: `file-progress/${configName}`,
    plugins: {
        "file-progress": pluginCore,
    },
    rules: {
        [`file-progress/${ruleName}`]: createRuleEntry(options),
    },
});

const configs: FileProgressPlugin["configs"] = {
    recommended: createPresetConfig("recommended", "activate"),
    "recommended-ci": createPresetConfig("recommended-ci", "activate", {
        hide: isCi,
    }),
    "recommended-ci-detailed": createPresetConfig(
        "recommended-ci-detailed",
        "activate",
        {
            detailedSuccess: true,
            hide: isCi,
            showSummaryWhenHidden: isCi,
        }
    ),
    "recommended-compact": createPresetConfig("recommended-compact", "compact"),
    "recommended-detailed": createPresetConfig(
        "recommended-detailed",
        "activate",
        {
            detailedSuccess: true,
        }
    ),
    "recommended-summary-only": createPresetConfig(
        "recommended-summary-only",
        "summary-only"
    ),
    "recommended-tty": createPresetConfig("recommended-tty", "activate", {
        ttyOnly: true,
    }),
};

const plugin: FileProgressPlugin = {
    ...pluginCore,
    configs,
} satisfies FileProgressPlugin;

export type {
    FileProgressConfigName,
    FileProgressPlugin,
    ProgressRuleOptions,
    ProgressSettings,
} from "./types.js";
export default plugin;

/**
 * @packageDocumentation
 * Synchronize or validate the preset matrix for eslint-plugin-file-progress-2.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectoryPath = dirname(fileURLToPath(import.meta.url));
const presetsIndexPath = resolve(
    scriptDirectoryPath,
    "../docs/rules/presets/index.md"
);
const builtPluginModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/index.js")
).href;
const markerStart = "<!-- begin generated preset matrix -->";
const markerEnd = "<!-- end generated preset matrix -->";

// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { default: builtPlugin } = await import(builtPluginModuleUrl);

/** @typedef {"activate" | "compact" | "summary-only"} RuleName */
/** @typedef {"recommended"
    | "recommended-ci"
    | "recommended-ci-detailed"
    | "recommended-compact"
    | "recommended-detailed"
    | "recommended-summary-only"
    | "recommended-tty"} PresetName */

/** @type {readonly PresetName[]} */
const presetOrder = [
    "recommended",
    "recommended-ci",
    "recommended-detailed",
    "recommended-compact",
    "recommended-summary-only",
    "recommended-tty",
    "recommended-ci-detailed",
];

/** @type {Readonly<
    Record<
        PresetName,
        {
            expectedRuleName: RuleName;
            optionSummary: string;
            purpose: string;
        }
    >
>} */
const presetMetadataByName = {
    recommended: {
        expectedRuleName: "activate",
        optionSummary: "defaults",
        purpose: "Default per-file progress for local CLI runs.",
    },
    "recommended-ci": {
        expectedRuleName: "activate",
        optionSummary: '`hide: CI === "true"`',
        purpose: "Hide all plugin output in CI.",
    },
    "recommended-ci-detailed": {
        expectedRuleName: "activate",
        optionSummary:
            '`detailedSuccess: true`, `hide: CI === "true"`, `showSummaryWhenHidden: CI === "true"`',
        purpose:
            "Keep CI quiet while still printing a detailed final summary there.",
    },
    "recommended-compact": {
        expectedRuleName: "compact",
        optionSummary: "defaults",
        purpose: "Use compact live mode without per-file paths.",
    },
    "recommended-detailed": {
        expectedRuleName: "activate",
        optionSummary: "`detailedSuccess: true`",
        purpose: "Keep full per-file progress and enrich the final summary.",
    },
    "recommended-summary-only": {
        expectedRuleName: "summary-only",
        optionSummary: "defaults",
        purpose: "Print only the final summary line.",
    },
    "recommended-tty": {
        expectedRuleName: "activate",
        optionSummary: "`ttyOnly: true`",
        purpose: "Only show progress on interactive terminals.",
    },
};

/**
 * @param {string} markdown
 *
 * @returns {"\n" | "\r\n"}
 */
const detectLineEnding = (markdown) =>
    markdown.includes("\r\n") ? "\r\n" : "\n";

/**
 * @param {string} markdown
 * @param {"\n" | "\r\n"} lineEnding
 *
 * @returns {string}
 */
const normalizeLineEndings = (markdown, lineEnding) =>
    markdown.replace(/\r?\n/gv, lineEnding);

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * @param {PresetName} presetName
 *
 * @returns {RuleName}
 */
const getEnabledRuleName = (presetName) => {
    const presetConfig = builtPlugin.configs[presetName];

    if (!isRecord(presetConfig) || !isRecord(presetConfig.rules)) {
        throw new TypeError(`Preset '${presetName}' is missing a rules block.`);
    }

    const fileProgressRuleNames = Object.keys(presetConfig.rules)
        .filter((ruleId) => ruleId.startsWith("file-progress/"))
        .map((ruleId) => ruleId.slice("file-progress/".length));

    if (fileProgressRuleNames.length !== 1) {
        throw new TypeError(
            `Preset '${presetName}' must enable exactly one file-progress rule.`
        );
    }

    return /** @type {RuleName} */ (fileProgressRuleNames[0]);
};

/**
 * @param {PresetName} presetName
 *
 * @returns {string}
 */
const createPresetDocsPath = (presetName) =>
    `./${presetName}.md`;

/**
 * @param {RuleName} ruleName
 *
 * @returns {string}
 */
const createRuleDocsPath = (ruleName) => `../${ruleName}.md`;

/**
 * @param {PresetName} presetName
 *
 * @returns {string}
 */
const createPresetRow = (presetName) => {
    const metadata = presetMetadataByName[presetName];
    const enabledRuleName = getEnabledRuleName(presetName);

    if (enabledRuleName !== metadata.expectedRuleName) {
        throw new TypeError(
            `Preset '${presetName}' enables '${enabledRuleName}', expected '${metadata.expectedRuleName}'.`
        );
    }

    return `| [\`${presetName}\`](${createPresetDocsPath(presetName)}) | [\`file-progress/${enabledRuleName}\`](${createRuleDocsPath(enabledRuleName)}) | ${metadata.optionSummary} | ${metadata.purpose} |`;
};

/**
 * @param {{ readonly configs: Readonly<Record<string, unknown>> }} plugin
 *
 * @returns {string}
 */
export const generatePresetMatrixSectionFromPlugin = (plugin) => {
    void plugin;

    return [
        "Generated from the preset registry.",
        "",
        "| Preset | Rule | Key options | Intended use |",
        "| --- | --- | --- | --- |",
        ...presetOrder.map(createPresetRow),
    ].join("\n");
};

/**
 * @param {string} markdown
 * @param {string} replacement
 *
 * @returns {string}
 */
const replaceMarkedSection = (markdown, replacement) => {
    const startOffset = markdown.indexOf(markerStart);
    const endOffset = markdown.indexOf(markerEnd);

    if (startOffset < 0 || endOffset < 0 || endOffset < startOffset) {
        throw new Error(
            "docs/rules/presets/index.md is missing the generated preset matrix markers."
        );
    }

    const lineEnding = detectLineEnding(markdown);
    const replacementBlock = normalizeLineEndings(
        `${markerStart}\n${replacement}\n${markerEnd}`,
        lineEnding
    );

    return `${markdown.slice(0, startOffset)}${replacementBlock}${markdown.slice(endOffset + markerEnd.length)}`;
};

/**
 * @param {{ readonly writeChanges: boolean }} input
 *
 * @returns {Promise<Readonly<{ changed: boolean }>>}
 */
export const syncPresetsRulesMatrix = async ({ writeChanges }) => {
    const presetsIndexMarkdown = await readFile(presetsIndexPath, "utf8");
    const generatedSection = generatePresetMatrixSectionFromPlugin(builtPlugin);
    const updatedMarkdown = replaceMarkedSection(
        presetsIndexMarkdown,
        generatedSection
    );
    const changed = updatedMarkdown !== presetsIndexMarkdown;

    if (!changed) {
        return { changed: false };
    }

    if (!writeChanges) {
        throw new Error(
            "Preset matrix is out of date. Run `npm run sync:presets-rules-matrix:write`."
        );
    }

    await writeFile(presetsIndexPath, updatedMarkdown, "utf8");
    return { changed: true };
};

const writeChanges = process.argv.includes("--write");
await syncPresetsRulesMatrix({ writeChanges });

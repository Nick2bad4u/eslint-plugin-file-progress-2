/**
 * @packageDocumentation
 * Synchronize or validate the README rules table for eslint-plugin-file-progress-2.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectoryPath = dirname(fileURLToPath(import.meta.url));
const readmeFilePath = resolve(scriptDirectoryPath, "../README.md");
const builtPluginModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/index.js")
).href;
const markerStart = "<!-- begin generated rules table -->";
const markerEnd = "<!-- end generated rules table -->";

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

/** @type {readonly RuleName[]} */
const ruleOrder = [
    "activate",
    "compact",
    "summary-only",
];

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
 * @param {string} presetName
 *
 * @returns {string}
 */
const createPresetDocsPath = (presetName) =>
    `./docs/rules/presets/${presetName}.md`;

/**
 * @param {RuleName} ruleName
 *
 * @returns {string}
 */
const createRuleDocsPath = (ruleName) => `./docs/rules/${ruleName}.md`;

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * @param {PresetName} presetName
 * @param {RuleName} ruleName
 *
 * @returns {boolean}
 */
const presetIncludesRule = (presetName, ruleName) => {
    const presetConfig = builtPlugin.configs[presetName];

    if (!isRecord(presetConfig) || !isRecord(presetConfig.rules)) {
        return false;
    }

    return Object.hasOwn(presetConfig.rules, `file-progress/${ruleName}`);
};

/**
 * @param {RuleName} ruleName
 *
 * @returns {string}
 */
const collectPresetLinks = (ruleName) => {
    const presetLinks = presetOrder
        .filter((presetName) => presetIncludesRule(presetName, ruleName))
        .map(
            (presetName) =>
                `[\`${presetName}\`](${createPresetDocsPath(presetName)})`
        );

    return presetLinks.length > 0 ? presetLinks.join(", ") : "—";
};

/**
 * @param {RuleName} ruleName
 *
 * @returns {string}
 */
const getRuleDescription = (ruleName) => {
    const ruleModule = builtPlugin.rules[ruleName];

    if (
        !isRecord(ruleModule) ||
        !isRecord(ruleModule.meta) ||
        !isRecord(ruleModule.meta.docs)
    ) {
        throw new TypeError(
            `Rule '${ruleName}' is missing meta.docs.description.`
        );
    }

    const description = ruleModule.meta.docs.description;

    if (typeof description !== "string" || description.trim().length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' is missing meta.docs.description.`
        );
    }

    return description.trim();
};

/**
 * @param {RuleName} ruleName
 *
 * @returns {string}
 */
const createRuleRow = (ruleName) =>
    `| [\`file-progress/${ruleName}\`](${createRuleDocsPath(ruleName)}) | ${getRuleDescription(ruleName)} | ${collectPresetLinks(ruleName)} |`;

/**
 * @param {{
 *     readonly rules: Readonly<Record<string, unknown>>;
 *     readonly configs: Readonly<Record<string, unknown>>;
 * }} plugin
 *
 * @returns {string}
 */
export const generateReadmeRulesSectionFromPlugin = (plugin) => {
    void plugin;

    return [
        "Generated from the plugin rule metadata and preset registry.",
        "",
        "| Rule | Description | Included in presets |",
        "| --- | --- | --- |",
        ...ruleOrder.map(createRuleRow),
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
            "README.md is missing the generated rules table markers."
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
export const syncReadmeRulesTable = async ({ writeChanges }) => {
    const readmeMarkdown = await readFile(readmeFilePath, "utf8");
    const generatedSection = generateReadmeRulesSectionFromPlugin(builtPlugin);
    const updatedReadme = replaceMarkedSection(
        readmeMarkdown,
        generatedSection
    );
    const changed = updatedReadme !== readmeMarkdown;

    if (!changed) {
        return { changed: false };
    }

    if (!writeChanges) {
        throw new Error(
            "README rules table is out of date. Run `npm run sync:readme-rules-table:write`."
        );
    }

    await writeFile(readmeFilePath, updatedReadme, "utf8");
    return { changed: true };
};

const writeChanges = process.argv.includes("--write");
await syncReadmeRulesTable({ writeChanges });

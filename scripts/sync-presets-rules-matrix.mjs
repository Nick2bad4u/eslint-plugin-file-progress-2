/**
 * @packageDocumentation
 * Synchronize or validate the preset matrix for eslint-plugin-file-progress-2.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectoryPath = dirname(fileURLToPath(import.meta.url));
const builtCatalogModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/_internal/plugin-catalog.js")
).href;
const builtPluginModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/index.js")
).href;
const markerStart = "<!-- begin generated preset matrix -->";
const markerEnd = "<!-- end generated preset matrix -->";
const presetsIndexPath = resolve(
    scriptDirectoryPath,
    "../docs/rules/presets/index.md"
);

// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { fileProgressPresetCatalog, getRuleCatalogEntry } = await import(
    builtCatalogModuleUrl
);
// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { default: builtPlugin } = await import(builtPluginModuleUrl);

/**
 * @type {readonly {
 *     docsPath: string;
 *     name: string;
 *     optionSummary: string;
 *     purpose: string;
 *     ruleName: string;
 * }[]}
 */
const presetCatalog = fileProgressPresetCatalog;

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
 * @param {string} presetName
 *
 * @returns {string}
 */
const getEnabledRuleName = (presetName) => {
    const presetConfig = builtPlugin.configs[presetName];

    if (!isRecord(presetConfig) || !isRecord(presetConfig["rules"])) {
        throw new TypeError(`Preset '${presetName}' is missing a rules block.`);
    }

    const fileProgressRuleNames = Object.keys(presetConfig["rules"])
        .filter((ruleId) => ruleId.startsWith("file-progress/"))
        .map((ruleId) => ruleId.slice("file-progress/".length));

    if (fileProgressRuleNames.length !== 1) {
        throw new TypeError(
            `Preset '${presetName}' must enable exactly one file-progress rule.`
        );
    }

    const [enabledRuleName] = fileProgressRuleNames;

    if (enabledRuleName === undefined) {
        throw new TypeError(`Preset '${presetName}' did not resolve a rule.`);
    }

    return enabledRuleName;
};

/**
 * @param {string} presetDocsPath
 *
 * @returns {string}
 */
const createPresetDocsPath = (presetDocsPath) =>
    `./${presetDocsPath.slice("./docs/rules/presets/".length)}`;

/**
 * @param {string} ruleName
 *
 * @returns {string}
 */
const createRuleDocsPath = (ruleName) =>
    `../${getRuleCatalogEntry(ruleName).docsId}.md`;

/**
 * @param {{
 *     docsPath: string;
 *     name: string;
 *     optionSummary: string;
 *     purpose: string;
 *     ruleName: string;
 * }} presetCatalogEntry
 *
 * @returns {string}
 */
const createPresetRow = (presetCatalogEntry) => {
    const enabledRuleName = getEnabledRuleName(presetCatalogEntry.name);

    if (enabledRuleName !== presetCatalogEntry.ruleName) {
        throw new TypeError(
            `Preset '${presetCatalogEntry.name}' enables '${enabledRuleName}', expected '${presetCatalogEntry.ruleName}'.`
        );
    }

    return `| [\`${presetCatalogEntry.name}\`](${createPresetDocsPath(presetCatalogEntry.docsPath)}) | [\`file-progress/${enabledRuleName}\`](${createRuleDocsPath(enabledRuleName)}) | ${presetCatalogEntry.optionSummary} | ${presetCatalogEntry.purpose} |`;
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
        ...presetCatalog.map(createPresetRow),
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

const isDirectExecution =
    typeof process.argv[1] === "string" &&
    pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
    await syncPresetsRulesMatrix({ writeChanges });
}

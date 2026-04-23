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
const builtCatalogModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/_internal/plugin-catalog.js")
).href;
const builtPluginModuleUrl = pathToFileURL(
    resolve(scriptDirectoryPath, "../dist/index.js")
).href;
const markerStart = "<!-- begin generated rules table -->";
const markerEnd = "<!-- end generated rules table -->";

// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { fileProgressPresetCatalog, fileProgressRuleCatalog } = await import(
    builtCatalogModuleUrl
);
// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { default: builtPlugin } = await import(builtPluginModuleUrl);

/** @type {readonly { docsPath: string; name: string }[]} */
const presetCatalog = fileProgressPresetCatalog;

/** @type {readonly { docsPath: string; name: string }[]} */
const ruleCatalog = fileProgressRuleCatalog;

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
    markdown.replaceAll(/\r?\n/gv, lineEnding);

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) => typeof value === "object" && value !== null;

/**
 * @typedef {Readonly<{
 *     readonly configs: Readonly<Record<string, unknown>>;
 *     readonly rules: Readonly<Record<string, unknown>>;
 * }>} ReadmeRulesPluginLike
 */

/**
 * @param {ReadmeRulesPluginLike} plugin
 * @param {string} presetName
 * @param {string} ruleName
 *
 * @returns {boolean}
 */
const presetIncludesRule = (plugin, presetName, ruleName) => {
    const presetConfig = plugin.configs[presetName];

    if (!isRecord(presetConfig) || !isRecord(presetConfig["rules"])) {
        return false;
    }

    return Object.hasOwn(presetConfig["rules"], `file-progress/${ruleName}`);
};

/**
 * @param {ReadmeRulesPluginLike} plugin
 * @param {typeof presetCatalog} currentPresetCatalog
 * @param {string} ruleName
 *
 * @returns {string}
 */
const collectPresetLinks = (plugin, currentPresetCatalog, ruleName) => {
    const presetLinks = currentPresetCatalog
        .filter((presetCatalogEntry) =>
            presetIncludesRule(plugin, presetCatalogEntry.name, ruleName)
        )
        .map(
            (presetCatalogEntry) =>
                `[\`${presetCatalogEntry.name}\`](${presetCatalogEntry.docsPath})`
        );

    return presetLinks.length > 0 ? presetLinks.join(", ") : "—";
};

/**
 * @param {ReadmeRulesPluginLike} plugin
 * @param {string} ruleName
 *
 * @returns {string}
 */
const getRuleDescription = (plugin, ruleName) => {
    const ruleModule = plugin.rules[ruleName];

    if (
        !isRecord(ruleModule) ||
        !isRecord(ruleModule["meta"]) ||
        !isRecord(ruleModule["meta"]["docs"])
    ) {
        throw new TypeError(
            `Rule '${ruleName}' is missing meta.docs.description.`
        );
    }

    const description = ruleModule["meta"]["docs"]["description"];

    if (typeof description !== "string" || description.trim().length === 0) {
        throw new TypeError(
            `Rule '${ruleName}' is missing meta.docs.description.`
        );
    }

    return description.trim();
};

/**
 * @param {ReadmeRulesPluginLike} plugin
 * @param {typeof presetCatalog} currentPresetCatalog
 * @param {{ docsPath: string; name: string }} ruleCatalogEntry
 *
 * @returns {string}
 */
const createRuleRow = (plugin, currentPresetCatalog, ruleCatalogEntry) =>
    `| [\`file-progress/${ruleCatalogEntry.name}\`](${ruleCatalogEntry.docsPath}) | ${getRuleDescription(plugin, ruleCatalogEntry.name)} | ${collectPresetLinks(plugin, currentPresetCatalog, ruleCatalogEntry.name)} |`;

/**
 * @param {ReadmeRulesPluginLike} plugin
 * @param {Readonly<{
 *     presetCatalog?: typeof presetCatalog;
 *     ruleCatalog?: typeof ruleCatalog;
 * }>} [input]
 *
 * @returns {string}
 */
export const generateReadmeRulesSectionFromPlugin = (plugin, input = {}) => {
    const resolvedPresetCatalog = input.presetCatalog ?? presetCatalog;
    const resolvedRuleCatalog = input.ruleCatalog ?? ruleCatalog;

    return [
        "Generated from the plugin rule metadata and preset registry.",
        "",
        "| Rule | Description | Included in presets |",
        "| --- | --- | --- |",
        ...resolvedRuleCatalog.map((ruleCatalogEntry) =>
            createRuleRow(plugin, resolvedPresetCatalog, ruleCatalogEntry)
        ),
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

const isDirectExecution =
    typeof process.argv[1] === "string" &&
    pathToFileURL(process.argv[1]).href === import.meta.url;

if (isDirectExecution) {
    await syncReadmeRulesTable({ writeChanges });
}

import { constants as fsConstants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generatePresetMatrixSectionFromPlugin } from "../../scripts/sync-presets-rules-matrix.mjs";
import { generateReadmeRulesSectionFromPlugin } from "../../scripts/sync-readme-rules-table.mjs";
import {
    fileProgressPresetCatalog,
    fileProgressRuleCatalog,
    getRuleCatalogEntry,
} from "../../src/_internal/plugin-catalog.js";
import plugin from "../../src/index.js";

const repositoryRootPath = path.resolve(
    fileURLToPath(new URL("../..", import.meta.url))
);
const readmeFilePath = path.resolve(repositoryRootPath, "README.md");
const presetsIndexFilePath = path.resolve(
    repositoryRootPath,
    "docs/rules/presets/index.md"
);

const readTextFile = async (filePath: string): Promise<string> =>
    readFile(filePath, "utf8");

const extractMarkedSection = (
    markdown: string,
    markerStart: string,
    markerEnd: string
): string => {
    const startOffset = markdown.indexOf(markerStart);
    const endOffset = markdown.indexOf(markerEnd);

    if (startOffset === -1 || endOffset === -1 || endOffset < startOffset) {
        throw new Error(
            `Missing marked section between ${markerStart} and ${markerEnd}.`
        );
    }

    return markdown
        .slice(startOffset + markerStart.length, endOffset)
        .trim()
        .replaceAll("\r\n", "\n");
};

describe("sync contracts", () => {
    it("catalog entries resolve to existing docs and plugin registrations", async () => {
        expect.hasAssertions();

        for (const ruleCatalogEntry of fileProgressRuleCatalog) {
            await access(
                path.resolve(repositoryRootPath, ruleCatalogEntry.docsPath),
                fsConstants.F_OK
            );

            expect(plugin.rules[ruleCatalogEntry.name]).toBeDefined();
            expect(plugin.rules[ruleCatalogEntry.name].meta.docs.url).toBe(
                ruleCatalogEntry.docsUrl
            );
        }

        for (const presetCatalogEntry of fileProgressPresetCatalog) {
            await access(
                path.resolve(repositoryRootPath, presetCatalogEntry.docsPath),
                fsConstants.F_OK
            );

            expect(plugin.configs[presetCatalogEntry.name]).toBeDefined();
            expect(presetCatalogEntry.ruleName in plugin.rules).toBeTruthy();
        }
    });

    it("readme generated rules section is in sync with plugin metadata", async () => {
        expect.hasAssertions();

        const readmeMarkdown = await readTextFile(readmeFilePath);
        const currentSection = extractMarkedSection(
            readmeMarkdown,
            "<!-- begin generated rules table -->",
            "<!-- end generated rules table -->"
        );
        const generatedSection = generateReadmeRulesSectionFromPlugin(plugin, {
            presetCatalog: fileProgressPresetCatalog,
            ruleCatalog: fileProgressRuleCatalog,
        }).replaceAll("\r\n", "\n");

        expect(currentSection).toBe(generatedSection);
    });

    it("preset matrix page is in sync with preset registry", async () => {
        expect.hasAssertions();

        const presetsIndexMarkdown = await readTextFile(presetsIndexFilePath);
        const currentSection = extractMarkedSection(
            presetsIndexMarkdown,
            "<!-- begin generated preset matrix -->",
            "<!-- end generated preset matrix -->"
        );
        const generatedSection = generatePresetMatrixSectionFromPlugin(plugin, {
            getRuleCatalogEntry: (ruleName) =>
                getRuleCatalogEntry(
                    ruleName as (typeof fileProgressRuleCatalog)[number]["name"]
                ),
            presetCatalog: fileProgressPresetCatalog,
        }).replaceAll("\r\n", "\n");

        expect(currentSection).toBe(generatedSection);
    });
});

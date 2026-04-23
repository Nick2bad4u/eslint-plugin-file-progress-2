/* eslint-disable canonical/filename-no-index -- This package intentionally uses src/index.ts as its public entrypoint. */
import type { Linter } from "eslint";
import type { Except } from "type-fest";

import { isDefined } from "ts-extras";

import type {
    FileProgressConfigName,
    FileProgressPlugin,
    FileProgressRuleName,
    ProgressRuleOptions,
    ProgressRuleOptionsTuple,
} from "./types.js";

import packageJson from "../package.json" with { type: "json" };
import {
    fileProgressPresetCatalog,
    fileProgressRuleCatalog,
} from "./_internal/plugin-catalog.js";
import progressRule from "./rules/progress.js";

const isCi = globalThis.process.env["CI"] === "true";

const createRuleEntry = (
    options?: Readonly<ProgressRuleOptions>
): Linter.RuleEntry<ProgressRuleOptionsTuple> =>
    isDefined(options) ? ["warn", options] : "warn";

const createCatalogRecord = <
    TName extends string,
    TCatalogEntry extends Readonly<{ name: TName }>,
    TValue,
>(
    catalogEntries: readonly TCatalogEntry[],
    getValue: (catalogEntry: TCatalogEntry) => TValue
): Record<TName, TValue> => {
    const catalogRecord = {} as Record<TName, TValue>;

    for (const catalogEntry of catalogEntries) {
        catalogRecord[catalogEntry.name] = getValue(catalogEntry);
    }

    return catalogRecord;
};

const ruleModulesByName = {
    activate: progressRule,
} satisfies FileProgressPlugin["rules"];

const pluginCore = {
    meta: {
        name: "eslint-plugin-file-progress-2",
        namespace: "file-progress",
        version: packageJson.version,
    },
    rules: createCatalogRecord(
        fileProgressRuleCatalog,
        ({ name }) => ruleModulesByName[name]
    ),
} satisfies Except<FileProgressPlugin, "configs">;

const createPresetConfig = (
    configName: FileProgressConfigName,
    ruleName: FileProgressRuleName,
    options?: Readonly<ProgressRuleOptions>
): Linter.Config => ({
    name: `file-progress/${configName}`,
    plugins: {
        "file-progress": pluginCore,
    },
    rules: {
        [`file-progress/${ruleName}`]: createRuleEntry(options),
    },
});

const presetOptionsByName: Readonly<
    Record<FileProgressConfigName, ProgressRuleOptions | undefined>
> = {
    recommended: undefined,
    "recommended-ci": {
        hide: isCi,
    },
    "recommended-ci-detailed": {
        detailedSuccess: true,
        hide: isCi,
        showSummaryWhenHidden: isCi,
    },
    "recommended-compact": {
        mode: "compact",
    },
    "recommended-detailed": {
        detailedSuccess: true,
    },
    "recommended-summary-only": {
        mode: "summary-only",
    },
    "recommended-tty": {
        ttyOnly: true,
    },
};

const configs: FileProgressPlugin["configs"] = createCatalogRecord<
    FileProgressConfigName,
    (typeof fileProgressPresetCatalog)[number],
    Linter.Config
>(fileProgressPresetCatalog, ({ name, ruleName }) =>
    createPresetConfig(name, ruleName, presetOptionsByName[name])
);

/**
 * Public plugin instance exported from the package root.
 */
const plugin: FileProgressPlugin = {
    ...pluginCore,
    configs,
} satisfies FileProgressPlugin;

/* eslint-disable no-barrel-files/no-barrel-files, canonical/no-re-export -- The package root intentionally re-exports its public type surface. */
export type {
    FileProgressConfigName,
    FileProgressPlugin,
    ProgressRuleOptions,
    ProgressSettings,
} from "./types.js";

export default plugin;
/* eslint-enable no-barrel-files/no-barrel-files, canonical/no-re-export -- Re-export block is limited to the public package boundary. */
/* eslint-enable canonical/filename-no-index -- Re-enable after the intentional public entrypoint module. */

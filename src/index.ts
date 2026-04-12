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
    options?: ProgressRuleOptions
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

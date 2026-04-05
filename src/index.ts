import type { Except } from "type-fest";

import type { FileProgressPlugin } from "./types.js";

import packageJson from "../package.json" with { type: "json" };
import compactRule from "./rules/compact.js";
import progressRule from "./rules/progress.js";
import summaryOnlyRule from "./rules/summary-only.js";

const isCi = globalThis.process.env["CI"] === "true";

const pluginCore = {
    meta: {
        name: "eslint-plugin-file-progress-2",
        version: packageJson.version,
    },
    rules: {
        activate: progressRule,
        compact: compactRule,
        "summary-only": summaryOnlyRule,
    },
} satisfies Except<FileProgressPlugin, "configs">;

const configs: FileProgressPlugin["configs"] = {
    recommended: {
        name: "file-progress/recommended",
        plugins: {
            "file-progress": pluginCore,
        },
        rules: {
            "file-progress/activate": "warn",
        },
    },
    "recommended-ci": {
        name: "file-progress/recommended-ci",
        plugins: {
            "file-progress": pluginCore,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                hide: isCi,
            },
        },
    },
    "recommended-detailed": {
        name: "file-progress/recommended-detailed",
        plugins: {
            "file-progress": pluginCore,
        },
        rules: {
            "file-progress/activate": "warn",
        },
        settings: {
            progress: {
                detailedSuccess: true,
            },
        },
    },
};

const plugin: FileProgressPlugin = {
    ...pluginCore,
    configs,
} satisfies FileProgressPlugin;

export type { FileProgressPlugin, ProgressSettings } from "./types.js";
export default plugin;

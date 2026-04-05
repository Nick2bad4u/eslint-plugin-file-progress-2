import type { FileProgressPlugin } from "./types.js";

import packageJson from "../package.json" with { type: "json" };
import progressRule from "./rules/progress.js";

const isCi = globalThis.process.env["CI"] === "true";

const plugin: FileProgressPlugin = {
    configs: {} as FileProgressPlugin["configs"],
    meta: {
        name: "eslint-plugin-file-progress-2",
        version: packageJson.version,
    },
    rules: {
        activate: progressRule,
    },
};

const configs: FileProgressPlugin["configs"] = {
    recommended: {
        name: "file-progress/recommended",
        plugins: {
            "file-progress": plugin,
        },
        rules: {
            "file-progress/activate": "warn",
        },
    },
    "recommended-ci": {
        name: "file-progress/recommended-ci",
        plugins: {
            "file-progress": plugin,
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
            "file-progress": plugin,
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

Object.assign(plugin.configs, configs);

export type { FileProgressPlugin, ProgressSettings } from "./types.js";
export default plugin;

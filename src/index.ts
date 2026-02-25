import progressRule from "./rules/progress.js";
import type { FileProgressPlugin } from "./types.js";

const plugin = {
    meta: {
        name: "eslint-plugin-file-progress",
        version: "3.0.2",
    },
    configs: {} as FileProgressPlugin["configs"],
    rules: {
        activate: progressRule,
    },
} satisfies FileProgressPlugin;

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
                hide: process.env.CI === "true",
            },
        },
    },
};

Object.assign(plugin.configs, configs);

export type { FileProgressPlugin, ProgressSettings } from "./types.js";
export default plugin;

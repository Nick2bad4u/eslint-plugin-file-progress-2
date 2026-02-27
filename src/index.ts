import progressRule from "./rules/progress.js";
import type { FileProgressPlugin } from "./types.js";

const env = process.env as NodeJS.ProcessEnv & { CI?: string };

const plugin: FileProgressPlugin = {
    meta: {
        name: "eslint-plugin-file-progress-2",
        version: "3.2.0",
    },
    configs: {} as FileProgressPlugin["configs"],
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
                hide: env.CI === "true",
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

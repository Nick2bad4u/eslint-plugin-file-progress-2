import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

/**
 * @param {unknown} value
 *
 * @returns {value is import("eslint").Linter.RulesRecord}
 */
const isRulesRecord = (value) => typeof value === "object" && value !== null;

/** @type {import("eslint").Linter.RulesRecord} */
const recommendedRules = {};
const recommendedConfigCandidate = /** @type {unknown} */ (
    plugin.configs?.["recommended"]
);
const recommendedRulesCandidate = isRulesRecord(recommendedConfigCandidate)
    ? recommendedConfigCandidate["rules"]
    : undefined;

if (isRulesRecord(recommendedRulesCandidate)) {
    Object.assign(recommendedRules, recommendedRulesCandidate);
}

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...nickTwoBadFourU.configs.withoutFileProgress2,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        name: "Local File Progress",
        plugins: {
            "file-progress": plugin,
        },
        rules: {
            ...recommendedRules,
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;

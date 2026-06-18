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

    {
        files: [
            "docs/docusaurus/docusaurus.config.ts",
            "docs/docusaurus/sidebars.rules.ts",
        ],
        name: "Docusaurus workspace config boundaries",
        rules: {
            "import-x/no-relative-packages": "off",
            "n/no-process-env": "off",
        },
    },
    {
        files: ["docs/docusaurus/src/pages/index.tsx"],
        name: "Docusaurus required page entrypoints",
        rules: {
            "canonical/filename-no-index": "off",
        },
    },
    {
        files: ["docs/docusaurus/src/js/modern-enhancements.ts"],
        name: "Docusaurus browser enhancement ergonomics",
        rules: {
            "@typescript-eslint/no-unnecessary-condition": "off",
            "@typescript-eslint/prefer-readonly-parameter-types": "off",
            "unicorn/dom-node-dataset": "off",
            "unicorn/no-top-level-side-effects": "off",
        },
    },
    {
        files: ["docs/docusaurus/typedoc-plugins/*.mjs"],
        name: "TypeDoc plugin parser utility ergonomics",
        rules: {
            "perfectionist/sort-modules": "off",
            "regexp/require-unicode-sets-regexp": "off",
            "regexp/sort-character-class-elements": "off",
            "unicorn/comment-content": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
            "unicorn/prefer-ternary": "off",
        },
    },
    {
        files: ["test/**/*.ts"],
        name: "Vitest assertion ergonomics",
        rules: {
            "max-lines-per-function": "off",
            "unicorn/max-nested-calls": "off",
        },
    },
    {
        files: ["test/_internal/rule-tester.ts"],
        name: "RuleTester global setup",
        rules: {
            "unicorn/no-top-level-side-effects": "off",
        },
    },

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

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
const sidebars: SidebarsConfig = {
    rules: [
        {
            className: "sb-doc-overview",
            id: "overview",
            label: "🏁 Overview",
            type: "doc",
        },
        {
            className: "sb-doc-getting-started",
            id: "getting-started",
            label: "🚀 Getting Started",
            type: "doc",
        },
        {
            className: "sb-cat-presets",
            collapsed: true,
            type: "category",
            label: "Presets",
            link: {
                type: "doc",
                id: "presets/index",
            },
            items: [
                {
                    className: "sb-preset-recommended",
                    id: "presets/recommended",
                    label: "🟡 Recommended",
                    type: "doc",
                },
                {
                    className: "sb-preset-recommended-ci",
                    id: "presets/recommended-ci",
                    label: "🟠 Recommended CI",
                    type: "doc",
                },
                {
                    className: "sb-preset-all",
                    id: "presets/recommended-detailed",
                    label: "🔵 Recommended Detailed",
                    type: "doc",
                },
            ],
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            type: "category",
            label: "Rules",
            link: {
                type: "generated-index",
                title: "Rule Reference",
                slug: "/",
                description:
                    "Documentation for the CLI progress rules shipped by eslint-plugin-file-progress-2.",
            },
            items: [
                {
                    id: "activate",
                    label: "01 file-progress/activate",
                    type: "doc",
                },
                {
                    id: "compact",
                    label: "02 file-progress/compact",
                    type: "doc",
                },
                {
                    id: "summary-only",
                    label: "03 file-progress/summary-only",
                    type: "doc",
                },
            ],
        },
    ],
};

export default sidebars;

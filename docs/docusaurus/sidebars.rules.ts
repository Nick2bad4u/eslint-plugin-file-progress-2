import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

import {
    fileProgressPresetCatalog,
    fileProgressRuleCatalog,
} from "../../src/_internal/plugin-catalog.js";

const sidebars = {
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
            items: fileProgressPresetCatalog.map(
                ({ docsId, sidebarClassName, sidebarLabel }) => ({
                    className: sidebarClassName,
                    id: docsId,
                    label: sidebarLabel,
                    type: "doc" as const,
                })
            ),
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
            items: fileProgressRuleCatalog.map(({ docsId, sidebarLabel }) => ({
                id: docsId,
                label: sidebarLabel,
                type: "doc" as const,
            })),
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;

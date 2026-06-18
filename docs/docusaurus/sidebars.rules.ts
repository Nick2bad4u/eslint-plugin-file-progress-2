import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

import {
    fileProgressPresetCatalog,
    fileProgressRuleCatalog,
} from "../../src/_internal/plugin-catalog";

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
            items: fileProgressPresetCatalog.map(
                ({ docsId, sidebarClassName, sidebarLabel }) => ({
                    className: sidebarClassName,
                    id: docsId,
                    label: sidebarLabel,
                    type: "doc" as const,
                })
            ),
            label: "Presets",
            link: {
                id: "presets/index",
                type: "doc",
            },
            type: "category",
        },
        {
            className: "sb-cat-rules",
            collapsed: true,
            items: fileProgressRuleCatalog.map(({ docsId, sidebarLabel }) => ({
                id: docsId,
                label: sidebarLabel,
                type: "doc" as const,
            })),
            label: "Rules",
            link: {
                description:
                    "Documentation for the CLI progress rules shipped by eslint-plugin-file-progress-2.",
                slug: "/",
                title: "Rule Reference",
                type: "generated-index",
            },
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;

import { themes as prismThemes } from "prism-react-renderer";

import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";

const organizationName = "Nick2bad4u";
const projectName = "eslint-plugin-file-progress-2";
const siteOrigin = "https://nick2bad4u.github.io";
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? `/${projectName}/`;
const siteUrl = `${siteOrigin}${baseUrl}`;
const siteDescription =
    "CLI-first documentation for eslint-plugin-file-progress-2, including setup guides, preset docs, rule reference, API pages, and maintainer notes.";
const socialCardImagePath = "img/logo.png";
const socialCardImageUrl = new URL(socialCardImagePath, siteUrl).toString();
const footerCopyright =
    `© ${new Date().getFullYear()} ` +
    '<a href="https://github.com/Nick2bad4u/" target="_blank" rel="noopener noreferrer">Nick2bad4u</a> 💻 Built with ' +
    '<a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">🦖 Docusaurus</a>.';

const config: Config = {
    baseUrl,
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.ico",
    headTags: [
        {
            attributes: {
                type: "application/ld+json",
            },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                description: siteDescription,
                image: socialCardImageUrl,
                name: projectName,
                publisher: {
                    "@type": "Person",
                    name: "Nick2bad4u",
                    url: "https://github.com/Nick2bad4u",
                },
                url: siteUrl,
            }),
            tagName: "script",
        },
    ],
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },
    markdown: {
        emoji: true,
        mermaid: true,
    },
    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onDuplicateRoutes: "warn",
    organizationName,
    plugins: [
        "docusaurus-plugin-image-zoom",
        [
            "@docusaurus/plugin-pwa",
            {
                pwaHead: [
                    {
                        href: `${baseUrl}manifest.json`,
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: "#2E2A33",
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        href: `${baseUrl}img/logo_192x192.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: "#4f46e5",
                        href: `${baseUrl}img/logo.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                ],
            },
        ],
        [
            "@docusaurus/plugin-content-docs",
            {
                editUrl: `https://github.com/${organizationName}/${projectName}/blob/master/docs/`,
                id: "rules",
                path: "../rules",
                routeBasePath: "docs/rules",
                showLastUpdateAuthor: true,
                showLastUpdateTime: true,
                sidebarPath: "./sidebars.rules.ts",
            } satisfies DocsPluginOptions,
        ],
    ],
    presets: [
        [
            "classic",
            {
                blog: false,
                docs: {
                    breadcrumbs: true,
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/master/docs/docusaurus/`,
                    includeCurrentVersion: true,
                    path: "site-docs",
                    routeBasePath: "docs",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                    sidebarCollapsed: true,
                    sidebarCollapsible: true,
                    sidebarPath: "./sidebars.ts",
                },
                googleTagManager: {
                    containerId: "GTM-T8J6HPLF",
                },
                gtag: {
                    trackingID: "G-18DR1S6R1T",
                },
                pages: {
                    editUrl: `https://github.com/${organizationName}/${projectName}/blob/master/docs/docusaurus/`,
                    exclude: [
                        "**/*.d.ts",
                        "**/*.d.tsx",
                        "**/__tests__/**",
                        "**/*.test.{js,jsx,ts,tsx}",
                        "**/*.spec.{js,jsx,ts,tsx}",
                    ],
                    include: ["**/*.{js,jsx,ts,tsx,md,mdx}"],
                    path: "src/pages",
                    routeBasePath: "/",
                },
                sitemap: {
                    filename: "sitemap.xml",
                    lastmod: "datetime",
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],
    projectName,
    tagline: "Flat Config-ready progress output and final summaries for ESLint CLI runs.",
    themeConfig: {
        colorMode: {
            defaultMode: "dark",
            disableSwitch: false,
            respectPrefersColorScheme: true,
        },
        footer: {
            copyright: footerCopyright,
            links: [
                {
                    items: [
                        {
                            label: "🏁 Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "📖 Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "🧑‍💻 Developer Docs",
                            to: "/docs/developer",
                        },
                        {
                            label: "📏 Rule Reference",
                            to: "/docs/rules",
                        },
                    ],
                    title: "📚 Explore",
                },
                {
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "\ueb09 Releases",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "\ue616 NPM Package",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "\uea84 Repository",
                        },
                    ],
                    title: "📁 Project",
                },
                {
                    items: [
                        {
                            href: "https://eslint.org/docs/latest/use/configure/configuration-files-new",
                            label: "\uf0ad Flat Config docs",
                        },
                        {
                            href: "https://eslint.org/docs/latest/use/command-line-interface",
                            label: "\uf120 ESLint CLI docs",
                        },
                        {
                            href: `https://github.com/sibiraj-s/eslint-plugin-file-progress`,
                            label: "\uea84 Original upstream plugin",
                        },
                        {
                            href: "https://www.npmjs.com/package/nanospinner",
                            label: "\uf113 nanospinner",
                        },
                        {
                            href: "https://www.npmjs.com/package/picocolors",
                            label: "\uf113 picocolors",
                        },
                    ],
                    title: "⚙️ Support",
                },
            ],
            logo: {
                alt: "eslint-plugin-file-progress-2 logo",
                href: `https://github.com/${organizationName}/${projectName}`,
                src: "img/logo.svg",
                width: 60,
                height: 60,
            },
            style: "dark",
        },
        image: socialCardImagePath,
        metadata: [
            {
                content:
                    "eslint, eslint-plugin, file-progress, progress output, flat config, cli, typescript",
                name: "keywords",
            },
            {
                content: socialCardImageUrl,
                property: "og:image",
            },
            {
                content: socialCardImageUrl,
                name: "twitter:image",
            },
            {
                content: "summary_large_image",
                name: "twitter:card",
            },
        ],
        navbar: {
            hideOnScroll: true,
            items: [
                {
                    items: [
                        {
                            label: "• Overview",
                            to: "/docs/rules/overview",
                        },
                        {
                            label: "• Getting Started",
                            to: "/docs/rules/getting-started",
                        },
                        {
                            label: "• Developer Docs",
                            to: "/docs/developer",
                        },
                    ],
                    label: "📚 Docs",
                    position: "left",
                    to: "/docs/rules/overview",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "• Rule Reference",
                            to: "/docs/rules",
                        },
                        {
                            label: "• file-progress/activate",
                            to: "/docs/rules/activate",
                        },
                    ],
                    label: "📜 Rules",
                    position: "left",
                    to: "/docs/rules",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "• Preset Reference",
                            to: "/docs/rules/presets",
                        },
                        {
                            label: "🟡 Recommended",
                            to: "/docs/rules/presets/recommended",
                        },
                        {
                            label: "🟠 Recommended CI",
                            to: "/docs/rules/presets/recommended-ci",
                        },
                        {
                            label: "🔵 Recommended Detailed",
                            to: "/docs/rules/presets/recommended-detailed",
                        },
                    ],
                    label: "🛠️ Presets",
                    position: "left",
                    to: "/docs/rules/presets",
                    type: "dropdown",
                },
                {
                    items: [
                        {
                            label: "• Development Guide",
                            to: "/docs/developer",
                        },
                        {
                            label: "• Docs & API Workflow",
                            to: "/docs/developer/docusaurus-site-contract",
                        },
                        {
                            label: "• Release Workflow",
                            to: "/docs/developer/release-workflow",
                        },
                        {
                            label: "• API Reference",
                            to: "/docs/developer/api",
                        },
                    ],
                    label: "\udb80\ude19 Dev",
                    position: "right",
                    to: "/docs/developer",
                    type: "dropdown",
                },
                {
                    href: `https://github.com/${organizationName}/${projectName}`,
                    items: [
                        {
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "• \ue709 GitHub",
                        },
                        {
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "• \ue616 NPM",
                        },
                        {
                            href: `https://github.com/${organizationName}/${projectName}/releases`,
                            label: "• \ueb09 Releases",
                        },
                    ],
                    label: "\ue65b GitHub",
                    position: "right",
                    type: "dropdown",
                },
            ],
            logo: {
                alt: "eslint-plugin-file-progress-2 logo",
                height: 48,
                href: baseUrl,
                src: "img/logo.svg",
                width: 48,
            },
            title: projectName,
        },
        prism: {
            additionalLanguages: ["bash", "json", "yaml", "typescript"],
            darkTheme: prismThemes.dracula,
            defaultLanguage: "typescript",
            theme: prismThemes.github,
        },
        tableOfContents: {
            maxHeadingLevel: 4,
            minHeadingLevel: 2,
        },
        zoom: {
            background: {
                dark: "rgb(50 50 50)",
                light: "rgb(255 255 255)",
            },
            selector: ".markdown > img",
        },
    } satisfies Preset.ThemeConfig,
    themes: [
        "@docusaurus/theme-mermaid",
        [
            "@easyops-cn/docusaurus-search-local",
            {
                hashed: true,
                highlightSearchTermsOnTargetPage: true,
                indexBlog: false,
                indexDocs: true,
                indexPages: false,
                language: ["en"],
                searchBarPosition: "left",
                searchBarShortcut: true,
                searchResultLimits: 8,
            },
        ],
    ],
    title: projectName,
    trailingSlash: false,
    url: siteOrigin,
};

export default config;

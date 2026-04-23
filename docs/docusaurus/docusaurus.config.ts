import { themes as prismThemes } from "prism-react-renderer";

import type { Options as DocsPluginOptions } from "@docusaurus/plugin-content-docs";
import type * as Preset from "@docusaurus/preset-classic";
import type { Config, PluginModule } from "@docusaurus/types";

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import {
    fileProgressPresetCatalog,
    fileProgressRuleCatalog,
} from "../../src/_internal/plugin-catalog.js";

/** GitHub organization used for edit links and project metadata. */
const organizationName = "Nick2bad4u";
/** Repository name used for edit links and project metadata. */
const projectName = "eslint-plugin-file-progress-2";
/** Public origin for the published documentation site. */
const siteOrigin = "https://nick2bad4u.github.io";
/** Route base path where docs site is deployed (GitHub Pages project path). */
const baseUrl = process.env["DOCUSAURUS_BASE_URL"] ?? `/${projectName}/`;
/** Canonical public site URL including the GitHub Pages project path. */
const siteUrl = `${siteOrigin}${baseUrl}`;
/** Canonical deployed docs root URL used for absolute project tool links. */
const deployedDocsRootUrl = `https://nick2bad4u.github.io${baseUrl}`;
/** Opt-in flag for experimental Docusaurus performance features. */
const enableExperimentalFaster =
    process.env["DOCUSAURUS_ENABLE_EXPERIMENTAL"] === "true";
/** Global site description used for SEO and social cards. */
const siteDescription =
    "CLI-first documentation for eslint-plugin-file-progress-2, including setup guides, preset docs, rule reference, API pages, and maintainer notes.";
/** Social preview image path relative to the static directory. */
const socialCardImagePath = "img/logo.png";
/** Absolute social preview image URL. */
const socialCardImageUrl = new URL(socialCardImagePath, siteUrl).toString();
/** Client module path for runtime DOM enhancement bootstrap script. */
const modernEnhancementsClientModule = fileURLToPath(
    new URL("src/js/modernEnhancements.ts", import.meta.url)
);
/** PWA theme-color meta value for Chromium-based browsers. */
const pwaThemeColor = "#6f63eb";
/** Windows tile color for pinned-site metadata. */
const pwaTileColor = "#6f63eb";
/** Safari pinned-tab mask icon color. */
const pwaMaskIconColor = "#8142a4";
const footerCopyright =
    `© ${new Date().getFullYear()} ` +
    '<a href="https://github.com/Nick2bad4u/" target="_blank" rel="noopener noreferrer">Nick2bad4u</a> 💻 Built with ' +
    '<a href="https://docusaurus.io/" target="_blank" rel="noopener noreferrer">🦖 Docusaurus</a>.';

const removeHeadAttrFlagKey = [
    "remove",
    "Le",
    "gacyPostBuildHeadAttribute",
].join("");

/** Local require helper rooted at the docs workspace config file location. */
const requireFromDocsWorkspace = createRequire(import.meta.url);

/** Resolve an optional module specifier without throwing when absent. */
const resolveOptionalModule = (moduleSpecifier: string): string | undefined => {
    try {
        return requireFromDocsWorkspace.resolve(moduleSpecifier);
    } catch {
        return undefined;
    }
};

const vscodeCssLanguageServiceEsmEntry = resolveOptionalModule(
    "vscode-css-languageservice/lib/esm/cssLanguageService.js"
);
const vscodeLanguageServerTypesEsmEntry = resolveOptionalModule(
    "vscode-languageserver-types/lib/esm/main.js"
);

/**
 * Alias VS Code language-service packages to their ESM entries when they are
 * present.
 *
 * @remarks
 * Some transitive editor-style dependencies resolve the UMD build of
 * `vscode-languageserver-types`, which causes noisy webpack critical-dependency
 * warnings inside Docusaurus. This plugin only activates when those optional
 * packages are actually installed in the current workspace.
 */
const suppressKnownWebpackWarningsPlugin: PluginModule = () => ({
    configureWebpack() {
        return {
            ignoreWarnings: [
                (warning: unknown) => {
                    const warningRecord = warning as
                        | Readonly<Record<string, unknown>>
                        | undefined;
                    const warningMessage = warningRecord?.["message"];

                    return (
                        typeof warningMessage === "string" &&
                        warningMessage.includes(
                            "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted"
                        )
                    );
                },
            ],
            resolve: {
                alias: {
                    ...(vscodeCssLanguageServiceEsmEntry === undefined
                        ? {}
                        : {
                              "vscode-css-languageservice$":
                                  vscodeCssLanguageServiceEsmEntry,
                          }),
                    ...(vscodeLanguageServerTypesEsmEntry === undefined
                        ? {}
                        : {
                              "vscode-languageserver-types$":
                                  vscodeLanguageServerTypesEsmEntry,
                              "vscode-languageserver-types/lib/umd/main.js$":
                                  vscodeLanguageServerTypesEsmEntry,
                          }),
                },
            },
        };
    },
    name: "suppress-known-webpack-warnings",
});

/** Docusaurus future flags, including optional experimental fast path. */
const futureConfig = {
    ...(enableExperimentalFaster
        ? {
              faster: {
                  mdxCrossCompilerCache: true,
                  rspackBundler: true,
                  rspackPersistentCache: true,
                  ssgWorkerThreads: true,
              },
          }
        : {}),
    v4: {
        [removeHeadAttrFlagKey]: true,
        // NOTE: Enabling cascade layers currently breaks our production CSS output
        // (CssMinimizer parsing errors -> large chunks of CSS dropped), which
        // makes many Infima (--ifm-*) variables undefined across the site.
        // Re-enable only after verifying the build output CSS is valid.
        useCssCascadeLayers: false,
        siteStorageNamespacing: true,
        fasterByDefault: true,
        removeLegacyPostBuildHeadAttribute: true,
        mdx1CompatDisabledByDefault: true,
    },
} satisfies Config["future"];

const config = {
    baseUrl,
    baseUrlIssueBanner: true,
    clientModules: [modernEnhancementsClientModule],
    deploymentBranch: "gh-pages",
    favicon: "img/favicon.svg",
    future: futureConfig,
    storage: {
        namespace: true,
        type: "localStorage",
    },
    headTags: [
        // Preconnect to GitHub for faster resource loading
        {
            attributes: { href: siteOrigin, rel: "preconnect" },
            tagName: "link",
        },
        {
            attributes: { href: "https://github.com", rel: "preconnect" },
            tagName: "link",
        },
        // JSON-LD structured data for rich search results
        {
            attributes: { type: "application/ld+json" },
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                applicationCategory: "DeveloperApplication",
                author: {
                    "@type": "Person",
                    name: organizationName,
                    url: `https://github.com/${organizationName}`,
                },
                description: siteDescription,
                image: socialCardImageUrl,
                license: "https://opensource.org/licenses/MIT",
                name: projectName,
                operatingSystem: "Any",
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
        anchors: {
            maintainCase: true,
        },
        emoji: true,
        format: "detect",
        hooks: {
            onBrokenMarkdownImages: "warn",
            onBrokenMarkdownLinks: "warn",
        },
        mermaid: true,
    },
    noIndex: false,
    onBrokenAnchors: "warn",
    onBrokenLinks: "warn",
    onDuplicateRoutes: "warn",
    organizationName,
    plugins: [
        suppressKnownWebpackWarningsPlugin,
        "docusaurus-plugin-image-zoom",
        [
            "@docusaurus/plugin-pwa",
            {
                debug: process.env["DOCUSAURUS_PWA_DEBUG"] === "true",
                offlineModeActivationStrategies: [
                    "appInstalled",
                    "standalone",
                    "queryString",
                ],
                pwaHead: [
                    {
                        href: `${baseUrl}manifest.json`,
                        rel: "manifest",
                        tagName: "link",
                    },
                    {
                        content: pwaThemeColor,
                        name: "theme-color",
                        tagName: "meta",
                    },
                    {
                        content: "yes",
                        name: "apple-mobile-web-app-capable",
                        tagName: "meta",
                    },
                    {
                        content: "default",
                        name: "apple-mobile-web-app-status-bar-style",
                        tagName: "meta",
                    },
                    {
                        href: `${baseUrl}img/apple-touch-icon.png`,
                        rel: "apple-touch-icon",
                        tagName: "link",
                    },
                    {
                        color: pwaMaskIconColor,
                        href: `${baseUrl}img/logo.svg`,
                        rel: "mask-icon",
                        tagName: "link",
                    },
                    {
                        content: `${baseUrl}img/web-app-manifest-192x192.png`,
                        name: "msapplication-TileImage",
                        tagName: "meta",
                    },
                    {
                        content: pwaTileColor,
                        name: "msapplication-TileColor",
                        tagName: "meta",
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
                    onInlineTags: "ignore",
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
                    mdxPageComponent: "@theme/MDXPage",
                    path: "src/pages",
                    routeBasePath: "/",
                    showLastUpdateAuthor: true,
                    showLastUpdateTime: true,
                },
                debug:
                    process.env["DOCUSAURUS_PRESET_CLASSIC_DEBUG"] === "true",
                sitemap: {
                    filename: "sitemap.xml",
                    ignorePatterns: ["/tests/**"],
                    lastmod: "datetime",
                },
                svgr: {
                    svgrConfig: {
                        dimensions: false,
                        expandProps: "start",
                        icon: true,
                        memo: true,
                        native: false,
                        prettier: true,
                        replaceAttrValues: {
                            "#000": "currentColor",
                            "#000000": "currentColor",
                        },
                        svgo: true,
                        svgoConfig: {
                            plugins: [{ active: false, name: "removeViewBox" }],
                        },
                        svgProps: { focusable: "false", role: "img" },
                        titleProp: true,
                        typescript: true,
                    },
                },
                theme: {
                    customCss: "./src/css/custom.css",
                },
            } satisfies Preset.Options,
        ],
    ],
    projectName,
    tagline:
        "Flat Config-ready progress output and final summaries for ESLint CLI runs.",
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
                            href: `https://github.com/${organizationName}/${projectName}`,
                            label: "\uea84 Repository",
                        },
                        {
                            href: `${deployedDocsRootUrl}eslint-inspector/`,
                            label: "\ue7d2 ESLint Inspector",
                        },
                        {
                            href: `${deployedDocsRootUrl}stylelint-inspector/`,
                            label: "\ue7d2 Stylelint Inspector",
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
                            href: `https://www.npmjs.com/package/${projectName}`,
                            label: "\ue616 NPM Package",
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
                content: siteDescription,
                name: "description",
            },
            {
                content: "summary_large_image",
                name: "twitter:card",
            },
        ],
        navbar: {
            style: "dark",
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
                        ...fileProgressRuleCatalog.map(
                            ({ docsId, navbarLabel }) => ({
                                label: navbarLabel,
                                to: `/docs/rules/${docsId}`,
                            })
                        ),
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
                        ...fileProgressPresetCatalog.map(
                            ({ name, navbarLabel }) => ({
                                label: navbarLabel,
                                to: `/docs/rules/presets/${name}`,
                            })
                        ),
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
            additionalLanguages: [
                "bash",
                "json",
                "yaml",
                "typescript",
            ],
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
                dark: "rgb(50, 50, 50)",
                light: "rgb(255, 255, 255)",
            },
            config: {
                // Options you can specify via https://github.com/francoischalifour/medium-zoom#usage
            },
            selector: ".markdown > img",
        },
    } satisfies Preset.ThemeConfig,
    themes: [
        "@docusaurus/theme-mermaid",
        [
            "@easyops-cn/docusaurus-search-local",
            {
                docsDir: "site-docs",
                docsRouteBasePath: "docs",
                explicitSearchResultPath: false,
                forceIgnoreNoIndex: true,
                fuzzyMatchingDistance: 1,
                hashed: true,
                hideSearchBarWithNoSearchContext: false,
                highlightSearchTermsOnTargetPage: true,
                indexBlog: false,
                indexDocs: true,
                indexPages: false,
                language: ["en"],
                removeDefaultStemmer: true,
                removeDefaultStopWordFilter: false,
                searchBarPosition: "left",
                searchBarShortcut: true,
                searchBarShortcutHint: true,
                searchBarShortcutKeymap: "ctrl+k",
                searchResultContextMaxLength: 96,
                searchResultLimits: 8,
                useAllContextsWithNoSearchContext: false,
            },
        ],
    ],
    title: projectName,
    trailingSlash: false,
    url: siteOrigin,
} satisfies Config;

export default config;

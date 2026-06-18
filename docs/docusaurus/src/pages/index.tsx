import type { JSX } from "react";

import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";

import GitHubStats from "../components/git-hub-stats";
import styles from "./index.module.css";

interface HeroBadge {
    readonly description: string;
    readonly icon: string;
    readonly label: string;
}

interface HeroStat {
    readonly description: string;
    readonly headline: string;
}

interface HomeCard {
    readonly description: string;
    readonly icon: string;
    readonly title: string;
    readonly to: string;
}

/**
 * Hero badges Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const heroBadges = [
    {
        description:
            "Drop-in config for ESLint v9+ and modern Flat Config projects.",
        icon: "\u{F013}",
        label: "Flat Config native",
    },
    {
        description: "Hide noisy spinner output automatically when CI=true.",
        icon: "\u{F0E7}",
        label: "CI-aware preset",
    },
    {
        description:
            "Optional end-of-run duration, file count, and throughput summary.",
        icon: "\u{F0AD}",
        label: "Detailed success summary",
    },
] as const satisfies readonly HeroBadge[];

/**
 * Hero stats Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const heroStats = [
    {
        description:
            "A single purpose-built rule focused on CLI lint progress output.",
        headline: "\u{F0CA} 1 Rule",
    },
    {
        description:
            "Recommended, CI-friendly, and detailed-summary presets ready to use.",
        headline: "\u{E690} 3 Presets",
    },
    {
        description:
            "Shows active file progress and a cleaner final summary for lint runs.",
        headline: "\u{F0068} CLI-first Progress UX",
    },
] as const satisfies readonly HeroStat[];

/**
 * Button icons Note: These icons are from the "Nerd Font Symbols" font.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const overviewButtonIcon = "\u{F071D}";
const comparePresetsButtonIcon = "\u{F1492}";
const heroKickerIcon = "\u{F0AD}";
const heroKickerIcon2 = "\u{F135}";
const homepageDescription =
    "Explore eslint-plugin-file-progress-2 documentation, presets, rule reference, and maintainer guides for CLI progress output during ESLint runs.";
const homepageKeywords =
    "eslint-plugin-file-progress-2, eslint progress, flat config, cli output, typescript linting";
const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository:
        "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2",
    description: homepageDescription,
    image: "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/img/logo.png",
    license:
        "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/blob/master/LICENSE",
    name: "eslint-plugin-file-progress-2",
    programmingLanguage: "TypeScript",
    runtimePlatform: "Node.js",
    url: "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/",
} as const;
const homepageSocialImageUrl =
    "https://nick2bad4u.github.io/eslint-plugin-file-progress-2/img/logo.png";

/**
 * Home card icons Note: These icons are from the "Nerd Font Symbols" font,
 * which is included in the site styles. If you change these icons, make sure to
 * choose ones that exist in that font or adjust the font-family in the CSS
 * accordingly.
 *
 * @see https://www.nerdfonts.com/cheat-sheet for available icons in the "Nerd Font Symbols" font
 */
const homeCards = [
    {
        description:
            "Install the plugin, enable a preset, and start showing progress during ESLint CLI runs.",
        icon: "\u{F135}",
        title: "Get Started",
        to: "/docs/rules/getting-started",
    },
    {
        description:
            "Choose between the default preset, CI-safe output, and detailed end-of-run summaries.",
        icon: "\u{E690}",
        title: "Presets",
        to: "/docs/rules/presets",
    },
    {
        description:
            "Review the activate rule, settings surface, and usage patterns for CLI-only progress output.",
        icon: "\u{F02D}",
        title: "Rule Reference",
        to: "/docs/rules",
    },
] as const satisfies readonly HomeCard[];

/**
 * Renders the home page for the documentation site.
 *
 * @returns Landing page content for eslint-plugin-file-progress-2 docs.
 */
export default function Home(): JSX.Element {
    const logoSrc = useBaseUrl("/img/logo.svg");

    return (
        <Layout
            description={homepageDescription}
            title="CLI-first ESLint progress output"
        >
            <Head>
                <meta content={homepageKeywords} name="keywords" />
                <meta content={homepageSocialImageUrl} property="og:image" />
                <meta content="summary_large_image" name="twitter:card" />
                <meta content={homepageSocialImageUrl} name="twitter:image" />
                <script type="application/ld+json">
                    {JSON.stringify(homepageStructuredData)}
                </script>
            </Head>
            <header className={styles.heroBanner}>
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroGrid}>
                        <div>
                            <p className={styles.heroKicker}>
                                {`${heroKickerIcon} ESLint progress output for modern CLI workflows ${heroKickerIcon2}`}
                            </p>
                            <Heading as="h1" className={styles.heroTitle}>
                                eslint-plugin-file-progress-2
                            </Heading>
                            <p className={styles.heroSubtitle}>
                                A focused ESLint plugin that prints live file
                                progress and optional end-of-run summaries while
                                linting. It is powered by{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkSpinner}`}
                                    href="https://github.com/usmanyunusov/nanospinner"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    nanospinner
                                </Link>{" "}
                                and{" "}
                                <Link
                                    className={`${styles.heroInlineLink} ${styles.heroInlineLinkTsExtras}`}
                                    href="https://github.com/alexeyraspopov/picocolors"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    picocolors
                                </Link>
                            </p>

                            <div className={styles.heroBadgeRow}>
                                {heroBadges.map((badge) => (
                                    <article
                                        className={styles.heroBadge}
                                        key={badge.label}
                                    >
                                        <p className={styles.heroBadgeLabel}>
                                            <span
                                                aria-hidden="true"
                                                className={styles.heroBadgeIcon}
                                            >
                                                {badge.icon}
                                            </span>
                                            {badge.label}
                                        </p>
                                        <p
                                            className={
                                                styles.heroBadgeDescription
                                            }
                                        >
                                            {badge.description}
                                        </p>
                                    </article>
                                ))}
                            </div>

                            <div className={styles.heroActions}>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionPrimary}`}
                                    to="/docs/rules/overview"
                                >
                                    {overviewButtonIcon} Start with Overview
                                </Link>
                                <Link
                                    className={`button button--lg ${styles.heroActionButton} ${styles.heroActionSecondary}`}
                                    to="/docs/rules/presets"
                                >
                                    {comparePresetsButtonIcon} Compare Presets
                                </Link>
                            </div>
                        </div>

                        <aside className={styles.heroPanel}>
                            <img
                                alt="eslint-plugin-file-progress-2 logo"
                                className={styles.heroPanelLogo}
                                decoding="async"
                                height="240"
                                loading="eager"
                                src={logoSrc}
                                width="240"
                            />
                        </aside>
                    </div>

                    <GitHubStats className={styles.heroLiveBadges} />

                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <article
                                className={styles.heroStatCard}
                                key={stat.headline}
                            >
                                <p className={styles.heroStatHeading}>
                                    {stat.headline}
                                </p>
                                <p className={styles.heroStatDescription}>
                                    {stat.description}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className="container">
                    <div className={styles.cardGrid}>
                        {homeCards.map((card) => (
                            <article className={styles.card} key={card.title}>
                                <div className={styles.cardHeader}>
                                    <p className={styles.cardIcon}>
                                        {card.icon}
                                    </p>
                                    <Heading
                                        as="h2"
                                        className={styles.cardTitle}
                                    >
                                        {card.title}
                                    </Heading>
                                </div>
                                <p className={styles.cardDescription}>
                                    {card.description}
                                </p>
                                <Link className={styles.cardLink} to={card.to}>
                                    Open section →
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>
            </main>
        </Layout>
    );
}

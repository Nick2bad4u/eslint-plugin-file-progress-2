import Link from "@docusaurus/Link";

import styles from "./GitHubStats.module.css";

type GitHubStatsProps = {
    readonly className?: string;
};

type LiveBadge = {
    readonly alt: string;
    readonly href: string;
    readonly src: string;
};

const liveBadges = [
    {
        alt: "npm license",
        href: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/blob/master/LICENSE",
        src: "https://flat.badgen.net/npm/license/eslint-plugin-file-progress-2?color=purple",
    },
    {
        alt: "npm total downloads",
        href: "https://www.npmjs.com/package/eslint-plugin-file-progress-2",
        src: "https://flat.badgen.net/npm/dt/eslint-plugin-file-progress-2?color=pink",
    },
    {
        alt: "latest GitHub release",
        href: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/releases",
        src: "https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-file-progress-2?color=cyan",
    },
    {
        alt: "GitHub stars",
        href: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/stargazers",
        src: "https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-file-progress-2?color=yellow",
    },
    {
        alt: "GitHub forks",
        href: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/forks",
        src: "https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-file-progress-2?color=green",
    },
    {
        alt: "GitHub open issues",
        href: "https://github.com/Nick2bad4u/eslint-plugin-file-progress-2/issues",
        src: "https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-file-progress-2?color=red",
    },
    {
        alt: "npm version",
        href: "https://www.npmjs.com/package/eslint-plugin-file-progress-2",
        src: "https://flat.badgen.net/npm/v/eslint-plugin-file-progress-2?color=blue",
    },
] as const satisfies readonly LiveBadge[];

/**
 * Renders live repository, package, and mutation badges.
 *
 * @param props - Optional list class override.
 *
 * @returns Badge strip with links to package/repository metadata.
 */
export default function GitHubStats({ className = "" }: GitHubStatsProps) {
    const liveBadgeListClassName = styles["liveBadgeList"] ?? "";
    const liveBadgeListItemClassName = styles["liveBadgeListItem"] ?? "";
    const liveBadgeAnchorClassName = styles["liveBadgeAnchor"] ?? "";
    const liveBadgeImageClassName = styles["liveBadgeImage"] ?? "";
    const badgeListClassName = [liveBadgeListClassName, className]
        .filter(Boolean)
        .join(" ");

    return (
        <ul className={badgeListClassName}>
            {liveBadges.map((badge) => (
                <li key={badge.src} className={liveBadgeListItemClassName}>
                    <Link
                        className={liveBadgeAnchorClassName}
                        href={badge.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            alt={badge.alt}
                            className={liveBadgeImageClassName}
                            src={badge.src}
                            loading="lazy"
                            decoding="async"
                        />
                    </Link>
                </li>
            ))}
        </ul>
    );
}

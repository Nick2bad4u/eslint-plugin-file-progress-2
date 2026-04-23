import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const packageJsonPath = path.join(repositoryRoot, "package.json");

/**
 * @typedef {Readonly<{ hash: string; subject: string }>} GitCommit
 */

/**
 * @typedef {Readonly<{
 *     compareUrl: string | undefined;
 *     commits: readonly GitCommit[];
 *     packageName: string;
 *     previousTag: string | undefined;
 *     repositoryUrl: string | undefined;
 *     tag: string;
 *     version: string;
 * }>} ReleaseNotesInput
 */

/**
 * @typedef {Readonly<{
 *     name?: unknown;
 *     repository?: unknown;
 *     version?: unknown;
 * }>} PackageJsonShape
 */

/**
 * @param {readonly string[]} argv
 *
 * @returns {Map<string, string>}
 */
const parseArguments = (argv) => {
    const args = new Map();

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];

        if (token?.startsWith("--")) {
            const key = token.slice(2);
            const value = argv[index + 1];

            if (value === undefined || value.startsWith("--")) {
                args.set(key, "true");
            } else {
                args.set(key, value);
                index += 1;
            }
        }
    }

    return args;
};

/**
 * @param {readonly string[]} arguments_
 *
 * @returns {Promise<string>}
 */
const runGit = async (arguments_) => {
    const { stdout } = await execFileAsync("git", arguments_, {
        cwd: repositoryRoot,
        windowsHide: true,
    });

    return stdout.trim();
};

/**
 * @param {readonly string[]} arguments_
 *
 * @returns {Promise<string | undefined>}
 */
const tryRunGit = async (arguments_) => {
    try {
        return await runGit(arguments_);
    } catch {
        return undefined;
    }
};

/**
 * @returns {Promise<PackageJsonShape>}
 */
const loadPackageJson = async () => {
    const packageJsonText = await readFile(packageJsonPath, "utf8");

    return /** @type {PackageJsonShape} */ (JSON.parse(packageJsonText));
};

/**
 * @param {unknown} repository
 *
 * @returns {string | undefined}
 */
const normalizeRepositoryUrl = (repository) => {
    if (typeof repository === "string") {
        return repository;
    }

    if (repository !== null && typeof repository === "object") {
        const repositoryRecord = /** @type {Record<string, unknown>} */ (
            repository
        );
        const repositoryUrl = repositoryRecord["url"];

        if (typeof repositoryUrl === "string") {
            return repositoryUrl;
        }
    }

    return undefined;
};

/**
 * @param {string | undefined} repositoryUrl
 *
 * @returns {string | undefined}
 */
const toHttpsRepositoryUrl = (repositoryUrl) => {
    if (repositoryUrl === undefined) {
        return undefined;
    }

    return repositoryUrl
        .replace(/^git\+/, "")
        .replace(/^git@github\.com:/u, "https://github.com/")
        .replace(/\.git$/u, "");
};

/**
 * @param {GitCommit} commit
 * @param {string | undefined} repositoryUrl
 *
 * @returns {string}
 */
const toMarkdownCommitLine = (commit, repositoryUrl) => {
    if (repositoryUrl === undefined) {
        return `- ${commit.subject} (${commit.hash})`;
    }

    return `- ${commit.subject} ([${commit.hash}](${repositoryUrl}/commit/${commit.hash}))`;
};

/**
 * @param {ReleaseNotesInput} input
 *
 * @returns {string}
 */
const buildReleaseNotes = ({
    commits,
    compareUrl,
    packageName,
    previousTag,
    repositoryUrl,
    tag,
    version,
}) => {
    const lines = [
        `# ${tag}`,
        "",
        `- Package: \`${packageName}@${version}\``,
    ];

    if (previousTag !== undefined) {
        lines.push(`- Previous release: \`${previousTag}\``);
    }

    if (compareUrl !== undefined) {
        lines.push(`- Compare: ${compareUrl}`);
    }

    lines.push("", "## Changes", "");

    if (commits.length === 0) {
        lines.push("- Version bump only.");
        return lines.join("\n");
    }

    for (const commit of commits) {
        lines.push(toMarkdownCommitLine(commit, repositoryUrl));
    }

    return lines.join("\n");
};

const main = async () => {
    const args = parseArguments(process.argv.slice(2));
    const outputPathValue = args.get("output");

    if (outputPathValue === undefined || outputPathValue.length === 0) {
        throw new Error("Missing required --output argument.");
    }

    const outputPath = path.resolve(repositoryRoot, outputPathValue);
    const packageJson = await loadPackageJson();
    const version =
        typeof packageJson.version === "string" &&
        packageJson.version.length > 0
            ? packageJson.version
            : "0.0.0";
    const packageName =
        typeof packageJson.name === "string" && packageJson.name.length > 0
            ? packageJson.name
            : path.basename(repositoryRoot);
    const tagArgument = args.get("tag");
    const tag =
        tagArgument !== undefined && tagArgument.length > 0
            ? tagArgument
            : `v${version}`;
    const repositoryUrl = toHttpsRepositoryUrl(
        normalizeRepositoryUrl(packageJson.repository)
    );
    const previousTag = await tryRunGit([
        "describe",
        "--tags",
        "--abbrev=0",
        `${tag}^`,
    ]);
    const commitRange =
        previousTag === undefined ? "HEAD" : `${previousTag}..HEAD`;
    const commitLogText = await tryRunGit([
        "log",
        "--no-merges",
        "--pretty=format:%H%x09%s",
        commitRange,
    ]);
    const commits =
        commitLogText === undefined || commitLogText.length === 0
            ? []
            : commitLogText.split(/\r?\n/u).map((line) => {
                  const [hash = "", subject = ""] = line.split("\t");

                  return /** @type {GitCommit} */ ({
                      hash,
                      subject,
                  });
              });
    const compareUrl =
        repositoryUrl !== undefined && previousTag !== undefined
            ? `${repositoryUrl}/compare/${previousTag}...${tag}`
            : undefined;
    const releaseNotes = buildReleaseNotes({
        commits,
        compareUrl,
        packageName,
        previousTag,
        repositoryUrl,
        tag,
        version,
    });

    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${releaseNotes}\n`, "utf8");
};

try {
    await main();
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
}

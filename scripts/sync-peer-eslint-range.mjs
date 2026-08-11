#!/usr/bin/env node

/**
 * Keep `peerDependencies.eslint` aligned with the currently installed
 * `devDependencies.eslint` upper range.
 *
 * Why: npm does not support `$eslint` indirection in `peerDependencies` (that
 * syntax is supported for `overrides` only), so we synchronize the top-end
 * range explicitly after dependency updates.
 */

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * The file path to the package.json file, resolved from the current module's
 * URL. This is used to read and update the package.json file for synchronizing
 * the peer dependency range for eslint.
 *
 * @type {string}
 *
 * @param {string} packageJsonPath - The file path to the package.json file.
 *
 * @see fileURLToPath
 * @see URL
 */
const packageJsonPath = fileURLToPath(
    new URL("../package.json", import.meta.url)
);
/**
 * The minimum supported range for eslint in peer dependencies. This is used as
 * a fallback when the existing peer range is not a valid string or cannot be
 * parsed to determine a floor candidate. This ensures that the peer dependency
 * range does not fall below a certain baseline, which is important for
 * maintaining compatibility with supported versions of eslint.
 *
 * @type {string}
 *
 * @see resolvePeerFloorRange
 */
const minimumSupportedEslintRange = "^9.0.0";

/**
 * Read and parse package.json.
 *
 * @type {() => Promise<Record<string, unknown>>}
 *
 * @returns {Promise<Record<string, unknown>>}
 *
 * @throws {TypeError} If reading or parsing package.json fails, an error is
 *   thrown with a descriptive message.
 *
 * @see readFile
 * @see fileURLToPath
 */
const readPackageJson = async () => {
    try {
        /** @type {string} */
        const packageJsonContent = await readFile(packageJsonPath, "utf8");
        /** @type {Record<string, unknown>} */
        return JSON.parse(packageJsonContent);
        /** @type {Error} */
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new TypeError(
            `Failed to read package.json at ${packageJsonPath}: ${message}`,
            { cause: error }
        );
    }
};

/**
 * Extract the major version from a caret range.
 *
 * @param {string} range
 *
 * @returns {number | undefined}
 */
const getCaretMajor = (range) => {
    const match = /^\^(\d+)\./u.exec(range);
    const majorText = match?.[1];

    return majorText === undefined ? undefined : Number.parseInt(majorText, 10);
};

/**
 * Preserve existing supported floors while adding a range for a new ESLint
 * major when necessary.
 *
 * @param {unknown} existingPeerRange
 * @param {string} devDependencyEslintRange
 *
 * @returns {string}
 */
export const resolvePeerEslintRange = (
    existingPeerRange,
    devDependencyEslintRange
) => {
    const existingRanges =
        typeof existingPeerRange === "string"
            ? existingPeerRange
                  .split("||")
                  .map((part) => part.trim())
                  .filter((part) => part.length > 0)
            : [];
    const supportedRanges =
        existingRanges.length > 0
            ? existingRanges
            : [minimumSupportedEslintRange];
    const devMajor = getCaretMajor(devDependencyEslintRange);

    if (
        devMajor === undefined ||
        supportedRanges.some((range) => getCaretMajor(range) === devMajor)
    ) {
        return supportedRanges.join(" || ");
    }

    return [...supportedRanges, devDependencyEslintRange].join(" || ");
};

/**
 * Check whether an unknown runtime value is a non-null object record.
 *
 * @type {(value: unknown) => value is Record<string, unknown>}
 *
 * @param {unknown} value
 *
 * @returns {value is Record<string, unknown>}
 *
 * @throws {TypeError} If the value is not a non-null object, an error is thrown
 *   with a descriptive message.
 */
const isRecord = (value) => typeof value === "object" && value !== null;

const main = async () => {
    /** @type {Record<string, unknown>} */
    const packageJson = await readPackageJson();

    /** @type {unknown} */
    const devDependencies = packageJson["devDependencies"];
    /** @type {unknown} */
    const peerDependencies = packageJson["peerDependencies"];

    if (!isRecord(devDependencies) || !isRecord(peerDependencies)) {
        /** @type {string} */
        throw new TypeError(
            "Expected package.json to include object-valued devDependencies and peerDependencies"
        );
    }

    /** @type {unknown} */
    const devDependencyEslintRange = devDependencies["eslint"];

    if (
        typeof devDependencyEslintRange !== "string" ||
        devDependencyEslintRange.trim().length === 0
    ) {
        throw new TypeError(
            "Expected devDependencies.eslint to be a non-empty string range"
        );
    }

    /** @type {string} */
    const nextPeerEslintRange = resolvePeerEslintRange(
        peerDependencies["eslint"],
        devDependencyEslintRange
    );

    /** @type {string} */
    if (peerDependencies["eslint"] === nextPeerEslintRange) {
        /** @type {string} */
        console.log(
            `peerDependencies.eslint already aligned: ${nextPeerEslintRange}`
        );
        /** @type {void} */
        return;
    }

    peerDependencies["eslint"] = nextPeerEslintRange;
    try {
        /** @type {string} */
        await writeFile(
            /** @type {string} */
            packageJsonPath,
            `${JSON.stringify(packageJson, null, 4)}\n`,
            "utf8"
        );
        /** @type {string} */
        console.log(
            `Updated peerDependencies.eslint to: ${nextPeerEslintRange}`
        );
    } catch (error) {
        /** @type {Error} */
        throw new TypeError(
            `Failed to write updated package.json with new peerDependencies.eslint: ${error}`,
            { cause: error }
        );
    }
};

/**
 * Execute the synchronization process, handling any errors gracefully. Errors
 * are logged to the console, and the process exits with a non-zero code to
 * indicate failure.
 *
 * @type {() => Promise<void>}
 *
 * @returns {Promise<void>}
 *
 * @throws {Error} If any step of the synchronization process fails, an error is
 *   thrown with a descriptive message.
 * @throws {TypeError} If reading or writing package.json fails, or if the
 *   expected structure of package.json is not met.
 *
 * @see writeFile
 * @see readPackageJson
 * @see isRecord
 * @see resolvePeerFloorRange
 * @see main
 */
const isMainModule =
    process.argv[1] !== undefined &&
    pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMainModule) {
    try {
        await main();
    } catch (error) {
        /** @type {Error} */
        console.error("Failed to synchronize peerDependencies.eslint:", error);
        /** @type {number} */
        process.exitCode = 1;
    }
}

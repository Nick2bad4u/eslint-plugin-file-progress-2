import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isRecord = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * @param {unknown} viewOutput
 *
 * @returns {unknown}
 */
const resolveSingleNpmViewManifest = (viewOutput) => {
    const manifests = Array.isArray(viewOutput) ? viewOutput : [viewOutput];

    if (manifests.length !== 1) {
        throw new Error(
            `Expected exactly one npm view manifest, received ${manifests.length}.`
        );
    }

    return manifests[0];
};

/**
 * @param {unknown} manifest
 * @param {"gitHead" | "version"} field
 *
 * @returns {unknown}
 */
const resolveSupportedManifestField = (manifest, field) => {
    if (!isRecord(manifest)) {
        return undefined;
    }

    if (field === "gitHead") {
        return manifest.gitHead;
    }

    if (field === "version") {
        return manifest.version;
    }

    throw new Error(`Unsupported npm view manifest field: ${field}`);
};

/**
 * Resolve a string field from the single manifest emitted by `npm view
 * <exact-version> --json`.
 *
 * Npm can emit either a manifest object or a one-element manifest array for an
 * exact version, including while a newly published version is propagating.
 *
 * @param {unknown} viewOutput
 * @param {"gitHead" | "version"} field
 *
 * @returns {string}
 */
export const resolveNpmViewManifestField = (viewOutput, field) => {
    const manifest = resolveSingleNpmViewManifest(viewOutput);
    const value = resolveSupportedManifestField(manifest, field);

    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(
            `The npm view manifest must contain a nonblank ${field} field.`
        );
    }

    return value.trim();
};

/**
 * @param {string} jsonText
 * @param {"gitHead" | "version"} field
 *
 * @returns {string}
 */
export const parseNpmViewManifestField = (jsonText, field) =>
    resolveNpmViewManifestField(JSON.parse(jsonText), field);

const scriptPath = fileURLToPath(import.meta.url);
const isMainModule =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === scriptPath;

if (isMainModule) {
    try {
        const field = process.argv[2];
        if (field !== "gitHead" && field !== "version") {
            throw new Error(`Unsupported npm view manifest field: ${field}`);
        }

        const jsonText = readFileSync(0, "utf8");
        console.log(parseNpmViewManifestField(jsonText, field));
    } catch {
        console.error(
            "Unable to resolve the npm view manifest field from standard input."
        );
        process.exitCode = 1;
    }
}

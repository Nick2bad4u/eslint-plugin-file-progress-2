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
 * Resolve a string field from the single manifest emitted by `npm view
 * <exact-version> --json`.
 *
 * Npm can emit either a manifest object or a one-element manifest array for an
 * exact version, including while a newly published version is propagating.
 *
 * @param {unknown} viewOutput
 * @param {string} field
 *
 * @returns {string}
 */
export const resolveNpmViewManifestField = (viewOutput, field) => {
    const manifests = Array.isArray(viewOutput) ? viewOutput : [viewOutput];

    if (manifests.length !== 1) {
        throw new Error(
            `Expected exactly one npm view manifest, received ${manifests.length}.`
        );
    }

    const [manifest] = manifests;
    const value = isRecord(manifest) ? manifest[field] : undefined;

    if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(
            `The npm view manifest must contain a nonblank ${field} field.`
        );
    }

    return value.trim();
};

/**
 * @param {string} jsonText
 * @param {string} field
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
        if (field === undefined || field.trim().length === 0) {
            throw new Error("A manifest field name is required.");
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

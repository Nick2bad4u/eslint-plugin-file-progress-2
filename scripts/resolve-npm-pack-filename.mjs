import { readFile } from "node:fs/promises";
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
 * Resolve the single package filename emitted by `npm pack --json`.
 *
 * Npm 11 and earlier emit an array of package records. npm 12 can emit an
 * object whose keys are package names and whose values are package records.
 *
 * @param {unknown} packOutput
 *
 * @returns {string}
 */
export const resolveNpmPackFilename = (packOutput) => {
    const records = Array.isArray(packOutput)
        ? packOutput
        : isRecord(packOutput)
          ? Object.values(packOutput)
          : [];

    if (records.length !== 1) {
        throw new Error(
            `Expected exactly one npm pack record, received ${records.length}.`
        );
    }

    const [record] = records;
    const filename = isRecord(record) ? record["filename"] : undefined;

    if (typeof filename !== "string" || filename.trim().length === 0) {
        throw new Error(
            "The npm pack record must contain a nonblank filename."
        );
    }

    return filename.trim();
};

/**
 * @param {string} jsonText
 *
 * @returns {string}
 */
export const parseNpmPackFilename = (jsonText) =>
    resolveNpmPackFilename(JSON.parse(jsonText));

const scriptPath = fileURLToPath(import.meta.url);
const isMainModule =
    process.argv[1] !== undefined &&
    path.resolve(process.argv[1]) === scriptPath;

if (isMainModule) {
    const packOutputPath = process.argv[2];

    if (packOutputPath === undefined) {
        console.error(
            "Usage: node scripts/resolve-npm-pack-filename.mjs <npm-pack-json-file>"
        );
        process.exitCode = 1;
    } else {
        try {
            const jsonText = await readFile(
                path.resolve(packOutputPath),
                "utf8"
            );
            console.log(parseNpmPackFilename(jsonText));
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            console.error(`Unable to resolve npm pack filename: ${message}`);
            process.exitCode = 1;
        }
    }
}

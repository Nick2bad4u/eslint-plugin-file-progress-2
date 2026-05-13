#!/usr/bin/env node

import { readdir, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();

/** @type {string[]} */
const ensureDirectories = [];
/** @type {string[]} */
const removalTargets = [];
/** @type {string[]} */
const tsBuildInfoRoots = [];

for (const argument of process.argv.slice(2)) {
    if (argument.startsWith("--ensure-dir=")) {
        ensureDirectories.push(argument.slice("--ensure-dir=".length));
        continue;
    }

    if (argument.startsWith("--tsbuildinfo-under=")) {
        tsBuildInfoRoots.push(argument.slice("--tsbuildinfo-under=".length));
        continue;
    }

    removalTargets.push(argument);
}

/**
 * @param {string} relativePath
 *
 * @returns {string}
 */
const toAbsolutePath = (relativePath) => path.resolve(cwd, relativePath);

/**
 * @param {string} relativePath
 *
 * @returns {Promise<void>}
 */
const removeTarget = async (relativePath) =>
    rm(toAbsolutePath(relativePath), {
        force: true,
        recursive: true,
    });

/**
 * @param {string} absoluteDirectoryPath
 *
 * @returns {Promise<void>}
 */
const removeTsBuildInfoFilesRecursively = async (absoluteDirectoryPath) => {
    let directoryEntries;

    try {
        directoryEntries = await readdir(absoluteDirectoryPath, {
            withFileTypes: true,
        });
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return;
        }

        throw error;
    }

    for (const directoryEntry of directoryEntries) {
        const absoluteEntryPath = path.join(
            absoluteDirectoryPath,
            directoryEntry.name
        );

        if (directoryEntry.isDirectory()) {
            await removeTsBuildInfoFilesRecursively(absoluteEntryPath);
            continue;
        }

        if (
            directoryEntry.isFile() &&
            directoryEntry.name.endsWith(".tsbuildinfo")
        ) {
            await rm(absoluteEntryPath, { force: true });
        }
    }
};

for (const removalTarget of removalTargets) {
    await removeTarget(removalTarget);
}

for (const tsBuildInfoRoot of tsBuildInfoRoots) {
    const absoluteRootPath = toAbsolutePath(tsBuildInfoRoot);

    await removeTsBuildInfoFilesRecursively(absoluteRootPath);
}

for (const ensureDirectory of ensureDirectories) {
    await mkdir(toAbsolutePath(ensureDirectory), { recursive: true });
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectRootPath = path.resolve(currentDirectoryPath, "..");
const distDirectoryPath = path.join(projectRootPath, "dist");

await mkdir(distDirectoryPath, { recursive: true });

await build({
    bundle: true,
    entryPoints: [path.join(projectRootPath, "src/index.ts")],
    format: "cjs",
    logLevel: "info",
    outfile: path.join(distDirectoryPath, "index.cjs"),
    packages: "external",
    platform: "node",
    sourcemap: false,
    target: ["node22"],
});

const cjsEntryPath = path.join(distDirectoryPath, "index.cjs");
const cjsEntryContent = await readFile(cjsEntryPath, "utf8");
const cjsInteropFooter = `

module.exports = module.exports.default;
module.exports.default = module.exports;
`;

await writeFile(cjsEntryPath, `${cjsEntryContent}${cjsInteropFooter}`, "utf8");

const cjsTypeDefinitionContent = `import plugin from "./index.js";

export = plugin;
`;

await writeFile(path.join(distDirectoryPath, "index.d.cts"), cjsTypeDefinitionContent, "utf8");

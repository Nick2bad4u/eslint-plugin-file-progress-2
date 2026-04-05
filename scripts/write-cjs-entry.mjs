import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const currentDirectoryPath = path.dirname(fileURLToPath(import.meta.url));
const projectRootPath = path.resolve(currentDirectoryPath, "..");
const distDirectoryPath = path.join(projectRootPath, "dist");

await mkdir(distDirectoryPath, { recursive: true });

await build({
    bundle: true,
    format: "cjs",
    stdin: {
        contents: [
            'const pluginModule = require("./src/index.ts");',
            "const plugin = pluginModule.default ?? pluginModule;",
            "module.exports = plugin;",
        ].join("\n"),
        loader: "js",
        resolveDir: projectRootPath,
        sourcefile: "cjs-entry.cjs",
    },
    logLevel: "info",
    outfile: path.join(distDirectoryPath, "index.cjs"),
    packages: "external",
    platform: "node",
    sourcemap: false,
    target: ["node22"],
});

const cjsTypeDefinitionContent = `import plugin from "./index.js";

export = plugin;
`;

await writeFile(
    path.join(distDirectoryPath, "index.d.cts"),
    cjsTypeDefinitionContent,
    "utf8"
);

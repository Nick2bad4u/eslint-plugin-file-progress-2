import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import plugin from "../dist/index.js";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const temporaryRoot = path.join(
    repositoryRoot,
    "temp",
    `oxlint-compatibility-${String(process.pid)}`
);
const eslintConfigPath = path.join(temporaryRoot, "eslint.config.mjs");
const oxlintConfigPath = path.join(temporaryRoot, "oxlint.config.json");
const fixturePath = path.join(temporaryRoot, "compatibility-fixture.js");
const eslintCliPath = path.join(
    repositoryRoot,
    "node_modules",
    "eslint",
    "bin",
    "eslint.js"
);
const oxlintCliPath = path.join(
    repositoryRoot,
    "node_modules",
    "oxlint",
    "bin",
    "oxlint"
);
const pluginSpecifier = "../../dist/index.js";
const ruleId = "file-progress/activate";
/** @type {readonly (keyof typeof plugin.configs)[]} */
const expectedConfigNames = [
    "recommended",
    "recommended-ci",
    "recommended-ci-detailed",
    "recommended-compact",
    "recommended-detailed",
    "recommended-summary-only",
    "recommended-tty",
];

/**
 * Remove timing and platform noise while retaining user-visible behavior.
 *
 * @param {string} output
 *
 * @returns {string}
 */
const normalizeOutput = (output) =>
    output
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n")
        .replace(/Duration: [^\n]+/gv, "Duration: <dynamic>")
        .replace(/Throughput: [^\n]+/gv, "Throughput: <dynamic>")
        .replaceAll("\\", "/")
        .trim();

/**
 * Run a local CLI through the current Node.js executable.
 *
 * @param {string} cliPath
 * @param {readonly string[]} arguments_
 *
 * @returns {string}
 */
const runCli = (cliPath, arguments_) => {
    const result = spawnSync(process.execPath, [cliPath, ...arguments_], {
        cwd: repositoryRoot,
        encoding: "utf8",
        env: {
            ...process.env,
            NO_COLOR: "1",
        },
        shell: false,
    });

    if (result.error !== undefined) {
        throw result.error;
    }

    assert.equal(
        result.status,
        0,
        [
            `Command failed: ${cliPath} ${arguments_.join(" ")}`,
            result.stdout,
            result.stderr,
        ].join("\n")
    );

    return `${result.stdout}${result.stderr}`;
};

/**
 * Read a local CLI version without coupling the assertion to patch releases.
 *
 * @param {string} cliPath
 *
 * @returns {string}
 */
const readVersion = (cliPath) =>
    runCli(cliPath, ["--version"]).trim().replace(/^v/v, "");

const main = async () => {
    const ruleNames = Object.keys(plugin.rules);
    const configNames = Object.keys(plugin.configs);

    assert.deepEqual(ruleNames, ["activate"]);
    assert.deepEqual(configNames, expectedConfigNames);

    await mkdir(temporaryRoot, { recursive: true });
    await writeFile(fixturePath, "export const compatible = true;\n", "utf8");

    const evidence = [];

    for (const configName of expectedConfigNames) {
        const config = plugin.configs[configName];
        const configRuleIds = Object.keys(config.rules ?? {});
        const ruleEntry = config.rules?.[ruleId];

        assert.deepEqual(configRuleIds, [ruleId]);
        assert.notEqual(ruleEntry, undefined);

        await writeFile(
            eslintConfigPath,
            [
                `import fileProgress from ${JSON.stringify(pluginSpecifier)};`,
                "",
                "export default [{",
                '    plugins: { "file-progress": fileProgress },',
                `    rules: { ${JSON.stringify(ruleId)}: ${JSON.stringify(ruleEntry)} },`,
                "}];",
                "",
            ].join("\n"),
            "utf8"
        );
        await writeFile(
            oxlintConfigPath,
            `${JSON.stringify(
                {
                    jsPlugins: [
                        {
                            name: "file-progress",
                            specifier: pluginSpecifier,
                        },
                    ],
                    rules: {
                        [ruleId]: ruleEntry,
                    },
                },
                undefined,
                2
            )}\n`,
            "utf8"
        );

        const eslintOutput = normalizeOutput(
            runCli(eslintCliPath, [
                "--config",
                eslintConfigPath,
                fixturePath,
            ])
        );
        const oxlintOutput = normalizeOutput(
            runCli(oxlintCliPath, [
                "--config",
                oxlintConfigPath,
                fixturePath,
            ])
        );

        assert.equal(
            oxlintOutput,
            eslintOutput,
            `Output mismatch for plugin.configs.${configName}.\nESLint:\n${eslintOutput}\nOxlint:\n${oxlintOutput}`
        );
        evidence.push({
            configName,
            normalizedOutput: oxlintOutput,
        });
    }

    console.log(
        JSON.stringify(
            {
                configCount: configNames.length,
                evidence,
                eslintVersion: readVersion(eslintCliPath),
                oxlintVersion: readVersion(oxlintCliPath),
                pluginVersion: plugin.meta.version,
                ruleCount: ruleNames.length,
            },
            undefined,
            2
        )
    );
};

try {
    await main();
} finally {
    await rm(temporaryRoot, { force: true, recursive: true });
}

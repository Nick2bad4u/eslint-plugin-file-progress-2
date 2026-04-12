import { existsSync } from "node:fs";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import tsParser from "@typescript-eslint/parser";
import { ESLint } from "eslint";
import pc from "picocolors";

/**
 * @typedef {import("eslint").Linter.Config} FlatConfig
 */

/**
 * @typedef {import("eslint").Linter.RuleEntry} RuleEntry
 */

/**
 * @typedef {Readonly<{
 *     fileGlob?: string;
 *     parser?: typeof tsParser;
 *     ruleOptions?: Readonly<Record<string, unknown>>;
 * }>} RuleConfigOptions
 */

/**
 * @typedef {Readonly<{
 *     code: string;
 *     filePath: string;
 *     name: string;
 *     overrideConfig: readonly FlatConfig[];
 * }>} Scenario
 */

const expectedEslintMajorArgumentPrefix = "--expect-eslint-major=";
const scriptsDirectoryPath = fileURLToPath(new URL(".", import.meta.url));
const repositoryRootPath = path.resolve(scriptsDirectoryPath, "..");
const builtPluginPath = path.resolve(repositoryRootPath, "dist/index.js");

if (!existsSync(builtPluginPath)) {
    throw new Error(
        `Missing built plugin entry at ${builtPluginPath}. Run \"npm run build\" before executing this smoke test.`
    );
}

// eslint-disable-next-line no-unsanitized/method -- Controlled repository-local file URL; no user input reaches import().
const { default: plugin } = await import(pathToFileURL(builtPluginPath).href);

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
const parseExpectedEslintMajor = (argv) => {
    const matchingArgument = argv.find((argument) =>
        argument.startsWith(expectedEslintMajorArgumentPrefix)
    );

    if (matchingArgument === undefined) {
        return undefined;
    }

    const majorString = matchingArgument.slice(
        expectedEslintMajorArgumentPrefix.length
    );

    if (majorString.length === 0) {
        throw new Error(
            `Missing ESLint major value in argument: ${matchingArgument}`
        );
    }

    const majorValue = Number.parseInt(majorString, 10);

    if (Number.isNaN(majorValue)) {
        throw new Error(
            `Invalid ESLint major value in argument: ${matchingArgument}`
        );
    }

    return majorValue;
};

/**
 * @param {number | undefined} expectedMajor
 */
const assertEslintMajor = (expectedMajor) => {
    const runtimeVersion = ESLint.version;

    if (typeof runtimeVersion !== "string" || runtimeVersion.length === 0) {
        throw new Error(
            `Unable to determine ESLint runtime version: ${String(runtimeVersion)}`
        );
    }

    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined || runtimeMajorText.length === 0) {
        throw new Error(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new Error(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected ESLint major ${expectedMajor}, but detected ${runtimeVersion}.`
        );
    }

    console.log(
        `${pc.green("✓")} ESLint runtime ${pc.bold(runtimeVersion)} detected for compatibility smoke checks.`
    );
};

/**
 * @param {FlatConfig | readonly FlatConfig[] | undefined} config
 * @param {string} configName
 *
 * @returns {readonly FlatConfig[]}
 */
const normalizeConfigArray = (config, configName) => {
    if (config === undefined) {
        throw new Error(`Missing plugin config: ${configName}`);
    }

    if (Array.isArray(config)) {
        return config;
    }

    return [/** @type {FlatConfig} */ (config)];
};

/**
 * @param {"activate"} ruleName
 * @param {RuleConfigOptions} [options]
 *
 * @returns {readonly FlatConfig[]}
 */
const createRuleConfig = (ruleName, options = {}) => {
    const fileGlob = options.fileGlob ?? "**/*.{js,ts}";
    const ruleEntry = /** @type {RuleEntry} */ (
        options.ruleOptions === undefined
            ? "warn"
            : ["warn", options.ruleOptions]
    );

    return [
        /** @type {FlatConfig} */ ({
            files: [fileGlob],
            languageOptions: {
                ...(options.parser === undefined
                    ? {}
                    : { parser: options.parser }),
                ecmaVersion: "latest",
                sourceType: "module",
            },
            name: `compat-smoke:file-progress/${ruleName}`,
            plugins: {
                "file-progress": plugin,
            },
            rules: {
                [`file-progress/${ruleName}`]: ruleEntry,
            },
        }),
    ];
};

/**
 * @param {string} configName
 *
 * @returns {readonly FlatConfig[]}
 */
const createPresetConfig = (configName) =>
    normalizeConfigArray(plugin.configs?.[configName], configName);

/**
 * @param {Scenario} scenario
 */
const runScenario = async ({ code, filePath, name, overrideConfig }) => {
    const eslint = new ESLint({
        cwd: repositoryRootPath,
        ignore: false,
        overrideConfig: [...overrideConfig],
        overrideConfigFile: true,
    });

    const lintResults = await eslint.lintText(code, { filePath });
    const allMessages = lintResults.flatMap((result) => result.messages);
    const fatalMessages = allMessages.filter(
        (message) => message.fatal === true
    );

    if (fatalMessages.length > 0) {
        throw new Error(
            `${name}: encountered fatal parse/runtime diagnostics (${fatalMessages.length}).`
        );
    }

    if (allMessages.length > 0) {
        const formattedMessages = allMessages
            .map(
                (message) =>
                    `${message.ruleId ?? "<no-rule>"}: ${message.message}`
            )
            .join("; ");

        throw new Error(
            `${name}: expected zero lint messages, received ${allMessages.length}. ${formattedMessages}`
        );
    }

    console.log(
        `${pc.green("✓")} ${pc.bold(name)} ${pc.gray("->")} completed with zero lint messages.`
    );
};

const scenarios = /** @type {const} */ ([
    {
        code: 'const foo = "bar";\n',
        filePath: path.resolve(
            repositoryRootPath,
            "src/eslint9-compat/recommended.js"
        ),
        name: "recommended-preset-js",
        overrideConfig: normalizeConfigArray(
            plugin.configs?.["recommended"],
            "recommended"
        ),
    },
    {
        code: 'const foo = "bar";\n',
        filePath: path.resolve(
            repositoryRootPath,
            "src/eslint9-compat/recommended-compact.js"
        ),
        name: "recommended-compact-preset-js",
        overrideConfig: createPresetConfig("recommended-compact"),
    },
    {
        code: 'const foo = "bar";\n',
        filePath: path.resolve(
            repositoryRootPath,
            "src/eslint9-compat/recommended-summary-only.js"
        ),
        name: "recommended-summary-only-preset-js",
        overrideConfig: createPresetConfig("recommended-summary-only"),
    },
    {
        code: 'const foo = "bar";\n',
        filePath: path.resolve(
            repositoryRootPath,
            "src/eslint9-compat/activate-compact.ts"
        ),
        name: "activate-rule-compact-mode-ts",
        overrideConfig: createRuleConfig("activate", {
            fileGlob: "**/*.ts",
            parser: tsParser,
            ruleOptions: {
                hide: true,
                minFilesBeforeShow: 3,
                mode: "compact",
                outputStream: "stdout",
                throttleMs: 50,
            },
        }),
    },
    {
        code: 'const foo = "bar";\n',
        filePath: path.resolve(
            repositoryRootPath,
            "src/eslint9-compat/activate-summary-only.js"
        ),
        name: "activate-rule-summary-only-mode-js",
        overrideConfig: createRuleConfig("activate", {
            ruleOptions: {
                hide: true,
                mode: "summary-only",
            },
        }),
    },
]);

console.log(pc.bold(pc.cyan("Running ESLint 9 compatibility smoke checks...")));

const expectedEslintMajor = parseExpectedEslintMajor(process.argv.slice(2));
assertEslintMajor(expectedEslintMajor);

for (const scenario of scenarios) {
    await runScenario(scenario);
}

console.log(pc.bold(pc.green("ESLint 9 compatibility smoke checks passed.")));

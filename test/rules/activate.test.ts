import { getPluginRule } from "../_internal/plugin-test-helpers.js";
import {
    createRuleTester,
    sharedValidCases,
} from "../_internal/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("activate", getPluginRule("activate") as never, {
    invalid: [],
    valid: [
        ...sharedValidCases,
        {
            code: 'const foo = "bar";',
            filename: "src/file-b.js",
            name: "hide all output via rule options",
            options: [
                {
                    hide: true,
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/file-c.js",
            name: "hide filename with custom success message",
            options: [
                {
                    hideFileName: true,
                    successMessage: "Lint done...",
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/file-d.js",
            name: "show filename on a second line",
            options: [
                {
                    fileNameOnNewLine: true,
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/nested/file-f.ts",
            name: "hide prefix and keep file names",
            options: [
                {
                    hidePrefix: true,
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/deeply/nested/file-g.ts",
            name: "use basename path formatting",
            options: [
                {
                    pathFormat: "basename",
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/deeply/nested/file-h.ts",
            name: "rule options override deprecated settings.progress",
            options: [
                {
                    hidePrefix: false,
                    pathFormat: "relative",
                },
            ],
            settings: {
                progress: {
                    hideDirectoryNames: true,
                    hidePrefix: true,
                },
            },
        },
        {
            code: 'const foo = "bar";',
            filename: "src/deeply/nested/file-i.ts",
            name: "deprecated settings.progress fallback still works",
            settings: {
                progress: {
                    hide: true,
                    hideDirectoryNames: true,
                },
            },
        },
        {
            code: 'const foo = "bar";',
            filename: "src/deeply/nested/file-j.ts",
            name: "new output control options parse safely",
            options: [
                {
                    minFilesBeforeShow: 5,
                    outputStream: "stdout",
                    showSummaryWhenHidden: true,
                    throttleMs: 100,
                    ttyOnly: true,
                },
            ],
        },
    ],
});

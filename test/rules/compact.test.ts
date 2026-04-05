import { getPluginRule } from "../_internal/plugin-test-helpers.js";
import {
    createRuleTester,
    sharedValidCases,
} from "../_internal/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("compact", getPluginRule("compact"), {
    invalid: [],
    valid: [
        ...sharedValidCases,
        {
            code: 'const foo = "bar";',
            filename: "src/compact-a.ts",
            name: "compact mode accepts live-output tuning options",
            options: [
                {
                    minFilesBeforeShow: 3,
                    outputStream: "stdout",
                    throttleMs: 50,
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/compact-b.ts",
            name: "compact mode still accepts deprecated settings fallback",
            settings: {
                progress: {
                    hide: true,
                    successMessage: "Done",
                },
            },
        },
    ],
});

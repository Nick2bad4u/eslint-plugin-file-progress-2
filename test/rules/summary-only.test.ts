import { getPluginRule } from "../_internal/plugin-test-helpers.js";
import {
    createRuleTester,
    sharedValidCases,
} from "../_internal/rule-tester.js";

const ruleTester = createRuleTester();

ruleTester.run("summary-only", getPluginRule("summary-only"), {
    invalid: [],
    valid: [
        ...sharedValidCases,
        {
            code: 'const foo = "bar";',
            filename: "src/summary-only-a.ts",
            name: "summary-only accepts detailed summary options",
            options: [
                {
                    detailedSuccess: true,
                    outputStream: "stdout",
                    showSummaryWhenHidden: true,
                },
            ],
        },
        {
            code: 'const foo = "bar";',
            filename: "src/summary-only-b.ts",
            name: "summary-only keeps deprecated settings fallback working",
            settings: {
                progress: {
                    detailedSuccess: true,
                    hidePrefix: true,
                },
            },
        },
    ],
});

import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.setDefaultConfig({
    languageOptions: {
        parser: tsParser,
    },
});

export const createRuleTester = (): RuleTester => new RuleTester();

export const sharedValidCases = [
    {
        code: 'const foo = "bar";',
        filename: "src/file-a.js",
    },
    {
        code: 'const foo = "bar";',
        filename: "src/file-e.ts",
    },
] as const;
